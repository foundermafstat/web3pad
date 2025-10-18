;; ft-implementation.clar
;; Advanced Game Economy FT implementation for Stacks (Clarity v2.1+)
;; Implements an extended FT trait (game-economy features).
;; NOTE: Replace placeholders (TRAIT principal, pubkeys, error codes) before deploy.

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Imports & trait binding (replace principal with real)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; (use-trait ft-trait-v2 'REPLACE_WITH_TRAIT_PRINCIPAL.ft-trait-v2)
;; (impl-trait ft-trait-v2) ;; Uncomment and set above when you have trait deployed

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Errors (uint codes)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-constant ERR_NOT_OWNER u100)
(define-constant ERR_PAUSED u101)
(define-constant ERR_INSUFFICIENT_BALANCE u102)
(define-constant ERR_NOT_ALLOWED u103)
(define-constant ERR_NONCE_USED u104)
(define-constant ERR_INVALID_SIG u105)
(define-constant ERR_ROYALTY_TOO_HIGH u106)
(define-constant ERR_BAD_INPUT u107)
(define-constant ERR_MINT_LIMIT u108)
(define-constant ERR_NOT_ADMIN u109)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Core token data
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var token-name (string-ascii 32) "GameToken")
(define-data-var token-symbol (string-ascii 8) "GME")
(define-data-var token-decimals uint u6)
(define-data-var total-supply uint u0)
(define-data-var supply-cap uint u1000000000000) ;; example cap (1e12 minimal units)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Ownership & admins & pausability
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var contract-owner principal tx-sender)
(define-map admins {admin: principal} {enabled: bool})
(define-data-var paused bool false)

(define-private (only-owner)
  (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_NOT_OWNER)))

(define-private (only-admin)
  (let ((is-admin (default-to false (get enabled (map-get? admins {admin: tx-sender})))))
    (asserts! (or (is-eq tx-sender (var-get contract-owner)) is-admin) (err ERR_NOT_ADMIN))))

(define-public (transfer-contract-ownership (new-owner principal))
  (begin
    (only-owner)
    (var-set contract-owner new-owner)
    (ok true)))

(define-public (add-admin (a principal))
  (begin
    (only-owner)
    (map-set admins {admin: a} {enabled: true})
    (ok true)))

(define-public (remove-admin (a principal))
  (begin
    (only-owner)
    (map-set admins {admin: a} {enabled: false})
    (ok true)))

(define-public (set-paused (v bool))
  (begin
    (only-admin)
    (var-set paused v)
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Balances, approvals, indexer logs
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map balances {owner: principal} {balance: uint})
(define-map allowances {owner: principal, spender: principal} {amount: uint})
(define-map operator-approvals {owner: principal, operator: principal} {approved: bool})

;; Indexer-friendly logs
(define-data-var transfer-counter uint u0)
(define-map transfer-log {seq: uint} {from: (optional principal), to: (optional principal), amount: uint, memo: (optional (buff 34)), block: uint})

(define-private (log-transfer (from (optional principal)) (to (optional principal)) (amount uint) (memo (optional (buff 34))))
  (let ((seq (var-get transfer-counter)))
    (map-set transfer-log {seq: seq} {from: from, to: to, amount: amount, memo: memo, block: block-height})
    (var-set transfer-counter (+ seq u1))
    (ok seq)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only views
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-name) (ok (var-get token-name)))
(define-read-only (get-symbol) (ok (var-get token-symbol)))
(define-read-only (get-decimals) (ok (var-get token-decimals)))
(define-read-only (get-total-supply) (ok (var-get total-supply)))
(define-read-only (get-supply-cap) (ok (var-get supply-cap)))
(define-read-only (get-balance (who principal))
  (ok (default-to u0 (get balance (map-get? balances {owner: who})))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Internal helpers for balance updates
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-private (get-balance-internal (who principal))
  (default-to u0 (get balance (map-get? balances {owner: who}))))

(define-private (set-balance-internal (who principal) (new-balance uint))
  (map-set balances {owner: who} {balance: new-balance})
  (ok true))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Transfer & transfer-from / approve / operator flow
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (set-approval-for-all (operator principal) (approved bool))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    (map-set operator-approvals {owner: tx-sender, operator: operator} {approved: approved})
    (ok true)))

(define-read-only (is-approved-for-all (owner principal) (operator principal))
  (ok (default-to false (get approved (map-get? operator-approvals {owner: owner, operator: operator})))))

(define-public (approve (spender principal) (amount uint))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    (map-set allowances {owner: tx-sender, spender: spender} {amount: amount})
    (ok true)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    ;; only allow tx-sender to be sender or approved operator/allowance
    (asserts! (or (is-eq tx-sender sender)
                  (unwrap-panic (is-approved-for-all sender tx-sender))
                  (>= (default-to u0 (get amount (map-get? allowances {owner: sender, spender: tx-sender}))) amount))
              (err ERR_NOT_ALLOWED))

    (let ((s-bal (get-balance-internal sender)))
      (asserts! (>= s-bal amount) (err ERR_INSUFFICIENT_BALANCE))
      (let ((r-bal (get-balance-internal recipient)))
        (begin
          (set-balance-internal sender (- s-bal amount))
          (set-balance-internal recipient (+ r-bal amount))
          ;; decrease allowance if used
          (if (is-eq tx-sender sender) (ok true) (begin
            (let ((curr (default-to u0 (get amount (map-get? allowances {owner: sender, spender: tx-sender})))))
              (map-set allowances {owner: sender, spender: tx-sender} {amount: (- curr amount)}))))
          ;; log
          (log-transfer (some sender) (some recipient) amount memo)
          (ok true))))))

(define-public (transfer-from (from principal) (to principal) (amount uint) (memo (optional (buff 34))))
  (begin
    (transfer amount from to memo)
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Minting / burning — with roles and off-chain-sig
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map minters {addr: principal} {enabled: bool})
(define-data-var mint-limit-per-call uint u1000000) ;; example per-call cap

(define-public (set-minter (addr principal) (enabled bool))
  (begin
    (only-admin)
    (map-set minters {addr: addr} {enabled: enabled})
    (ok true)))

(define-private (is-minter (addr principal))
  (ok (default-to false (get enabled (map-get? minters {addr: addr})))))

(define-public (mint (amount uint) (recipient principal) (memo (optional (buff 34))))
  (begin
    (only-admin) ;; or change to is-minter check as desired
    (asserts! (<= amount (var-get mint-limit-per-call)) (err ERR_MINT_LIMIT))
    (var-set total-supply (+ (var-get total-supply) amount))
    (set-balance-internal recipient (+ (get-balance-internal recipient) amount))
    (log-transfer none (some recipient) amount memo)
    (ok true)))

(define-public (burn (amount uint) (owner principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender owner) (unwrap-panic (is-approved-for-all owner tx-sender))) (err ERR_NOT_ALLOWED))
    (let ((b (get-balance-internal owner)))
      (asserts! (>= b amount) (err ERR_INSUFFICIENT_BALANCE))
      (set-balance-internal owner (- b amount))
      (var-set total-supply (- (var-get total-supply) amount))
      (log-transfer (some owner) none amount memo)
      (ok true))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Off-chain mint using secp256k1-signed vouchers (whitelist/mint)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Simple voucher format (off-chain):
;; voucher = sha256( concat(contract-address || recipient || amount || nonce || chain-id) )
;; signer signs voucher with secp256k1 and returns signature (65 bytes)
;;
(define-map used-nonces {signer: principal, nonce: uint} {used: bool})
(define-map trusted-signers {signer: principal} {pubkey: (buff 33)})

(define-public (add-trusted-signer (signer principal) (pubkey (buff 33)))
  (begin
    (only-admin)
    (map-set trusted-signers {signer: signer} {pubkey: pubkey})
    (ok true)))

(define-read-only (is-nonce-used (signer principal) (nonce uint))
  (ok (default-to false (get used (map-get? used-nonces {signer: signer, nonce: nonce})))))

;; payload building helper (for doc only; off-chain you must build bytes exactly same)
(define-private (build-voucher-payload (recipient principal) (amount uint) (nonce uint))
  (sha256 (concat (concat (principal-to-buff (as-contract tx-sender)) (principal-to-buff recipient))
                 (concat (uint-to-buff amount) (uint-to-buff nonce)))))

(define-public (mint-with-sig (recipient principal) (amount uint) (nonce uint) (sig (buff 65)) (signer principal))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    (asserts! (not (is-nonce-used signer nonce)) (err ERR_NONCE_USED))
    (let ((entry (map-get? trusted-signers {signer: signer})))
      (match entry
        signer-data
        (let ((pub (get pubkey signer-data))
              (payload (build-voucher-payload recipient amount nonce)))
          (asserts! (secp256k1-verify payload sig pub) (err ERR_INVALID_SIG))
          ;; mark nonce used
          (map-set used-nonces {signer: signer, nonce: nonce} {used: true})
          ;; execute mint
          (asserts! (<= amount (var-get mint-limit-per-call)) (err ERR_MINT_LIMIT))
          (var-set total-supply (+ (var-get total-supply) amount))
          (set-balance-internal recipient (+ (get-balance-internal recipient) amount))
          (log-transfer none (some recipient) amount (some (buff-from-string "mint-with-sig")))
          (ok true))
        (err ERR_BAD_INPUT)))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Batch operations (atomic due to Clarity transaction model)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (batch-transfer (ops (list 50 {amount: uint, sender: principal, recipient: principal})))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    ;; pre-check balances to avoid partial state changes (optional but recommended)
    (fold (lambda (op acc)
            (let ((s (get balance (map-get? balances {owner: (get sender op)}))))
              (asserts! (>= (default-to u0 s) (get amount op)) (err ERR_INSUFFICIENT_BALANCE))
              acc))
          true
          ops)
    ;; apply transfers
    (fold (lambda (op acc)
            (begin
              (transfer (get amount op) (get sender op) (get recipient op) (none))
              true))
          true
          ops)
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Reward pools (simple on-chain accounting) + distribution
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map reward-pools {game-id: uint} {balance: uint, creator: principal, created-at: uint})
(define-map reward-distribution-log {seq: uint} {game-id: uint, total: uint, recipients: uint, block: uint})
(define-data-var reward-counter uint u0)

(define-public (create-reward-pool (game-id uint) (initial-amount uint))
  (begin
    (only-admin)
    (map-set reward-pools {game-id: game-id} {balance: initial-amount, creator: tx-sender, created-at: block-height})
    (ok true)))

(define-public (distribute-rewards (game-id uint) (recipients (list 50 {recipient: principal, amount: uint})))
  (begin
    (only-admin)
    (let ((pool (map-get? reward-pools {game-id: game-id})))
      (match pool
        p
        (let ((bal (get balance p))
              (total (fold (lambda (r acc) (+ acc (get amount r))) u0 recipients)))
          (asserts! (>= bal total) (err ERR_INSUFFICIENT_BALANCE))
          ;; subtract pool
          (map-set reward-pools {game-id: game-id} {balance: (- bal total), creator: (get creator p), created-at: (get created-at p)})
          ;; distribute to recipients
          (fold (lambda (r acc)
                  (let ((to (get recipient r)) (amt (get amount r)))
                    (set-balance-internal to (+ (get-balance-internal to) amt))
                    (log-transfer none (some to) amt none)
                    true))
                true
                recipients)
          ;; log distribution
          (let ((seq (var-get reward-counter)))
            (map-set reward-distribution-log {seq: seq} {game-id: game-id, total: total, recipients: (len recipients), block: block-height})
            (var-set reward-counter (+ seq u1)))
          (ok true)))
        (err ERR_BAD_INPUT)))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Staking (simple model): stake deposits tokens into game pool and credits staked map
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map staked {owner: principal, game-id: uint} {amount: uint, since: uint})
(define-map staked-total {game-id: uint} {amount: uint})

(define-public (stake (game-id uint) (amount uint))
  (begin
    (asserts! (not (var-get paused)) (err ERR_PAUSED))
    ;; transfer tokens to contract (self)
    (transfer amount tx-sender (as-contract tx-sender) none)
    ;; record stake
    (let ((curr (default-to u0 (get amount (map-get? staked {owner: tx-sender, game-id: game-id})))))
      (map-set staked {owner: tx-sender, game-id: game-id} {amount: (+ curr amount), since: block-height})
      (let ((tot (default-to u0 (get amount (map-get? staked-total {game-id: game-id})))))
        (map-set staked-total {game-id: game-id} {amount: (+ tot amount)})))
    (ok true)))

(define-public (unstake (game-id uint) (amount uint))
  (begin
    (let ((entry (map-get? staked {owner: tx-sender, game-id: game-id})))
      (match entry
        st
        (let ((curr (get amount st)))
          (asserts! (>= curr amount) (err ERR_INSUFFICIENT_BALANCE))
          (map-set staked {owner: tx-sender, game-id: game-id} {amount: (- curr amount), since: (get since st)})
          (let ((tot (default-to u0 (get amount (map-get? staked-total {game-id: game-id})))))
            (map-set staked-total {game-id: game-id} {amount: (- tot amount)}))
          ;; transfer tokens back to user
          (transfer amount (as-contract tx-sender) tx-sender none)
          (ok true)))
        (err ERR_BAD_INPUT)))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Governance (lightweight): create-proposal, vote, tally (on-chain minimal)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map proposals {id: uint} {creator: principal, title: (string-utf8 256), created: uint, yes: uint, no: uint, open: bool})
(define-data-var proposal-counter uint u0)
(define-map votes {proposal-id: uint, voter: principal} {choice: bool})

(define-public (create-proposal (title (string-utf8 256)))
  (begin
    (only-admin)
    (let ((id (var-get proposal-counter)))
      (map-set proposals {id: id} {creator: tx-sender, title: title, created: block-height, yes: u0, no: u0, open: true})
      (var-set proposal-counter (+ id u1))
      (ok id))))

(define-public (vote (proposal-id uint) (choice bool))
  (begin
    (let ((p (map-get? proposals {id: proposal-id})))
      (match p
        prop
        (asserts! (get open prop) (err ERR_BAD_INPUT))
        ;; get voting power = balance (optionally staked + delegated)
        (let ((power (get-balance-internal tx-sender)))
          (asserts! (> power u0) (err ERR_BAD_INPUT))
          (map-set votes {proposal-id: proposal-id, voter: tx-sender} {choice: choice})
          (if choice
              (map-set proposals {id: proposal-id} {creator: (get creator prop), title: (get title prop), created: (get created prop), yes: (+ (get yes prop) power), no: (get no prop), open: (get open prop)})
              (map-set proposals {id: proposal-id} {creator: (get creator prop), title: (get title prop), created: (get created prop), yes: (get yes prop), no: (+ (get no prop) power), open: (get open prop)}))
          (ok true)))
        (err ERR_BAD_INPUT)))))

(define-read-only (get-proposal (id uint))
  (ok (map-get? proposals {id: id})))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Bridge adapters & events (simple)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-map bridge-adapters {idx: uint} {uri: (string-utf8 256)})
(define-data-var bridge-counter uint u0)
(define-map bridge-events {seq: uint} {payload: (buff 128), emitter: principal, block: uint})

(define-public (register-bridge-adapter (uri (string-utf8 256)))
  (begin
    (only-admin)
    (let ((idx (var-get bridge-counter)))
      (map-set bridge-adapters {idx: idx} {uri: uri})
      (var-set bridge-counter (+ idx u1))
      (ok idx))))

(define-public (emit-bridge-event (payload (buff 128)))
  (begin
    (only-admin)
    (let ((seq (var-get bridge-counter)))
      (map-set bridge-events {seq: seq} {payload: payload, emitter: tx-sender, block: block-height})
      (var-set bridge-counter (+ seq u1))
      (ok seq))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Metadata & adapter URIs
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-data-var contract-metadata {version: uint, uri: (string-utf8 256)} {version: u1, uri: ""})
(define-map game-adapters {game-id: uint} {uri: (string-utf8 256)})

(define-public (update-contract-metadata (uri (string-utf8 256)) (version uint))
  (begin
    (only-admin)
    (var-set contract-metadata {version: version, uri: uri})
    (ok true)))

(define-public (update-game-adapter-uri (game-id uint) (uri (string-utf8 256)))
  (begin
    (only-admin)
    (map-set game-adapters {game-id: game-id} {uri: uri})
    (ok true)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Utility views
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-read-only (get-contract-metadata) (ok (var-get contract-metadata)))
(define-read-only (get-game-adapter-uri (game-id uint)) (ok (get uri (map-get? game-adapters {game-id: game-id}))))
(define-read-only (get-bridge-adapters) (ok (map entries bridge-adapters)))
