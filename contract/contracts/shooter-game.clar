;; shooter-game.clar
;; Modular Shooter Game Module for Stacks Blockchain Launchpad Registry
;; 
;; Features:
;; - Interoperable real-time game module within multi-game Launchpad registry
;; - Game session lifecycle: open → finalized → disputed
;; - Off-chain verified results using secp256k1-verify
;; - Replay protection through result-hash registry
;; - NFT stat progression (exp/level updates)
;; - FT or STX rewards claim logic
;; - Launchpad Registry integration for future game modules
;; - Whitelisted off-chain game servers
;; - Optional metadata buffer for IPFS/compact payloads
;;
;; Compatibility: Clarity v2.1, Clarinet, Stacks 2.5+

;; === MODULE REGISTRATION ===
;; This contract is designed to be registered in a Launchpad Registry
;; Game modules can be added through registry integration

;; === TRAITS (Commented out for deployment compatibility) ===
;; (use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;; (use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; === ERROR CODES ===
(define-constant err-unauthorised (err u100))
(define-constant err-session-not-found (err u101))
(define-constant err-session-closed (err u102))
(define-constant err-invalid-sig (err u103))
(define-constant err-untrusted-server (err u104))
(define-constant err-replay (err u105))
(define-constant err-no-rewards (err u106))
(define-constant err-nft-mismatch (err u107))
(define-constant err-invalid-params (err u108))
(define-constant err-transfer-failed (err u109))
(define-constant err-invalid-game-id (err u110))
(define-constant err-insufficient-balance (err u111))
(define-constant err-dispute-expired (err u112))
(define-constant err-already-claimed (err u113))

;; === CONTRACT CONFIGURATION ===
(define-constant contract-owner tx-sender)
(define-constant game-module-id u1) ;; Unique ID for shooter game module
(define-constant exp-per-level u100) ;; Experience points required per level
(define-constant max-level u100) ;; Maximum NFT level
(define-constant dispute-window-blocks u144) ;; 24 hours in blocks (assuming 10min blocks)

;; === CORE DATA STRUCTURES ===

;; Game sessions with full lifecycle management
(define-map sessions
  uint ;; session-id
  {
    player: principal,
    game-module-id: uint,
    start-block: uint,
    end-block: (optional uint),
    canonical-score: (optional uint),
    result-hash: (optional (buff 32)),
    status: (string-ascii 16), ;; "open", "finalized", "disputed"
    nft-token-id: (optional uint), ;; NFT used in game (if any)
    exp-gained: (optional uint) ;; Experience gained from this session
  }
)

;; Player statistics across all games
(define-map player-stats
  principal
  {
    total-score: uint,
    total-kills: uint,
    total-games-played: uint,
    last-play-block: uint,
    preferred-game-module: uint
  }
)

;; NFT statistics and progression
(define-map nft-stats
  uint ;; token-id
  {
    exp: uint,
    level: uint,
    durability: uint,
    games-played: uint,
    total-score: uint
  }
)

;; Pending rewards waiting to be claimed
(define-map pending-rewards
  uint ;; session-id
  {
    player: principal,
    ft-contract: (optional principal), ;; None = STX reward
    amount: uint,
    claimed: bool,
    claim-block: (optional uint)
  }
)

;; Whitelisted game servers (trusted off-chain servers)
(define-map trusted-servers
  (buff 33) ;; compressed secp256k1 public key (33 bytes)
  {
    enabled: bool,
    server-name: (string-ascii 32),
    last-seen-block: uint
  }
)

;; Replay protection - processed result hashes
(define-map processed-results
  (buff 32) ;; result-hash
  {
    processed: bool,
    session-id: uint,
    processed-block: uint
  }
)

;; Game module registry (for future extensibility)
(define-map game-modules
  uint ;; module-id
  {
    name: (string-ascii 32),
    enabled: bool,
    contract-address: principal,
    min-score: uint,
    max-score: uint
  }
)

;; Dispute records
(define-map disputes
  uint ;; session-id
  {
    reason: (buff 16),
    disputer: principal,
    dispute-block: uint,
    resolved: bool
  }
)

;; === GLOBAL VARIABLES ===
(define-data-var session-nonce uint u0)
(define-data-var total-games-played uint u0)
(define-data-var total-rewards-distributed uint u0)

;; === HELPER FUNCTIONS ===

;; Check if caller is contract owner
(define-read-only (is-owner)
  (ok (is-eq tx-sender contract-owner))
)

;; Check if server is trusted
(define-read-only (is-trusted-server (pubkey (buff 33)))
  (default-to false (get enabled (map-get? trusted-servers pubkey)))
)

;; Check if result hash has been processed (replay protection)
(define-read-only (is-result-processed (result-hash (buff 32)))
  (default-to false (get processed (map-get? processed-results result-hash)))
)

;; Calculate NFT level from experience
(define-read-only (calculate-level (exp uint))
  (if (> exp u0)
    (min (/ exp exp-per-level) max-level)
    u1
  )
)

;; Get session by ID
(define-read-only (get-session (session-id uint))
  (map-get? sessions session-id)
)

;; Get player stats
(define-read-only (get-player-stats (player principal))
  (map-get? player-stats player)
)

;; Get NFT stats
(define-read-only (get-nft-stats (token-id uint))
  (map-get? nft-stats token-id)
)

;; Get pending reward
(define-read-only (get-pending-reward (session-id uint))
  (map-get? pending-rewards session-id)
)

;; === ADMIN FUNCTIONS ===

;; Register/unregister trusted game server
(define-public (set-trusted-server (pubkey (buff 33)) (enabled bool) (server-name (string-ascii 32)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
    (ok (map-set trusted-servers pubkey {
      enabled: enabled,
      server-name: server-name,
      last-seen-block: burn-block-height
    }))
  )
)

;; Register new game module (for Launchpad Registry integration)
(define-public (register-game-module (module-id uint) (name (string-ascii 32)) (contract-address principal) (min-score uint) (max-score uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
    (ok (map-set game-modules module-id {
      name: name,
      enabled: true,
      contract-address: contract-address,
      min-score: min-score,
      max-score: max-score
    }))
  )
)

;; === GAME SESSION MANAGEMENT ===

;; Start a new game session
(define-public (start-session (player principal) (nft-token-id (optional uint)))
  (let (
    (session-id (var-get session-nonce))
    (current-block burn-block-height)
  )
    (begin
      ;; Initialize session
      (map-set sessions session-id {
        player: player,
        game-module-id: game-module-id,
        start-block: current-block,
        end-block: none,
        canonical-score: none,
        result-hash: none,
        status: "open",
        nft-token-id: nft-token-id,
        exp-gained: none
      })
      
      ;; Update counters
      (var-set session-nonce (+ session-id u1))
      (var-set total-games-played (+ (var-get total-games-played) u1))
      
      (ok session-id)
    )
  )
)

;; Report game result with off-chain verification
(define-public (report-result 
  (session-id uint) 
  (result-hash (buff 32)) 
  (sig (buff 64)) 
  (server-pubkey (buff 33)) 
  (canonical-score uint)
  (exp-gained uint)
  (meta (optional (buff 128)))
)
  (let (
    (session (unwrap! (map-get? sessions session-id) err-session-not-found))
    (player (get player session))
    (status (get status session))
    (current-block burn-block-height)
  )
    (begin
      ;; Validation checks
      (asserts! (is-eq tx-sender player) err-unauthorised)
      (asserts! (is-eq status "open") err-session-closed)
      (asserts! (is-trusted-server server-pubkey) err-untrusted-server)
      (asserts! (not (is-result-processed result-hash)) err-replay)
      
      ;; Verify signature
      (asserts! (secp256k1-verify result-hash sig server-pubkey) err-invalid-sig)
      
      ;; Validate score range
      (asserts! (and (>= canonical-score u0) (<= canonical-score u1000000)) err-invalid-params)
      
      ;; Update session with result
      (map-set sessions session-id (merge session {
        end-block: (some current-block),
        canonical-score: (some canonical-score),
        result-hash: (some result-hash),
        status: "finalized",
        exp-gained: (some exp-gained)
      }))
      
      ;; Mark result as processed (replay protection)
      (map-set processed-results result-hash {
        processed: true,
        session-id: session-id,
        processed-block: current-block
      })
      
      ;; Update server last seen
      (map-set trusted-servers server-pubkey (merge (unwrap-panic (map-get? trusted-servers server-pubkey)) {
        last-seen-block: current-block
      }))
      
      ;; Update NFT stats if NFT was used
      (if (is-some (get nft-token-id session))
        (add-nft-exp (unwrap! (get nft-token-id session) err-invalid-params) exp-gained)
        true
      )
      
      ;; Update player stats
      (update-player-stats player canonical-score)
      
      (ok true)
    )
  )
)

;; === NFT PROGRESSION SYSTEM ===

;; Internal function to update NFT experience and level
(define-private (add-nft-exp (token-id uint) (exp-gain uint))
  (let (
    (entry (map-get? nft-stats token-id))
    (current-block burn-block-height)
  )
    (match entry
      nft-entry
      (let (
        (new-exp (+ (get exp nft-entry) exp-gain))
        (new-level (calculate-level new-exp))
        (old-level (get level nft-entry))
      )
        (begin
          ;; Update NFT stats
          (map-set nft-stats token-id {
            exp: new-exp,
            level: new-level,
            durability: (get durability nft-entry),
            games-played: (+ (get games-played nft-entry) u1),
            total-score: (+ (get total-score nft-entry) (get canonical-score (unwrap-panic (map-get? sessions (var-get session-nonce)))))
          })
          
          ;; Return level up status
          (> new-level old-level)
        )
      )
      ;; Initialize new NFT stats
      (begin
        (map-set nft-stats token-id {
          exp: exp-gain,
          level: (calculate-level exp-gain),
          durability: u100,
          games-played: u1,
          total-score: u0
        })
        true
      )
    )
  )
)

;; Update player statistics
(define-private (update-player-stats (player principal) (score uint))
  (let (
    (entry (map-get? player-stats player))
    (current-block burn-block-height)
  )
    (match entry
      player-entry
      (map-set player-stats player {
        total-score: (+ (get total-score player-entry) score),
        total-kills: (+ (get total-kills player-entry) (if (> score u1000) u1 u0)), ;; Assume >1000 score = 1 kill
        total-games-played: (+ (get total-games-played player-entry) u1),
        last-play-block: current-block,
        preferred-game-module: (get preferred-game-module player-entry)
      })
      ;; Initialize new player stats
      (map-set player-stats player {
        total-score: score,
        total-kills: (if (> score u1000) u1 u0),
        total-games-played: u1,
        last-play-block: current-block,
        preferred-game-module: game-module-id
      })
    )
  )
)

;; === REWARD SYSTEM ===

;; Set up reward for a session
(define-public (setup-reward (session-id uint) (ft-contract (optional principal)) (amount uint))
  (let (
    (session (unwrap! (map-get? sessions session-id) err-session-not-found))
    (player (get player session))
    (status (get status session))
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (is-eq status "finalized") err-session-closed)
      
      ;; Check if reward already exists
      (asserts! (is-none (map-get? pending-rewards session-id)) err-already-claimed)
      
      ;; Create pending reward
      (map-set pending-rewards session-id {
        player: player,
        ft-contract: ft-contract,
        amount: amount,
        claimed: false,
        claim-block: none
      })
      
      (ok true)
    )
  )
)

;; Claim reward from a session
(define-public (claim-reward (session-id uint))
  (let (
    (session (unwrap! (map-get? sessions session-id) err-session-not-found))
    (player (get player session))
    (reward (unwrap! (map-get? pending-rewards session-id) err-no-rewards))
    (ft-contract (get ft-contract reward))
    (amount (get amount reward))
    (claimed (get claimed reward))
    (current-block burn-block-height)
  )
    (begin
      ;; Validation checks
      (asserts! (is-eq tx-sender player) err-unauthorised)
      (asserts! (not claimed) err-already-claimed)
      
      ;; Process reward transfer
      (if (is-some ft-contract)
        ;; FT transfer
        (let ((ftc (unwrap! ft-contract err-invalid-params)))
          (let ((transfer-result (contract-call? ftc transfer amount (as-contract tx-sender) player none)))
            (match transfer-result
              success (begin
                ;; Mark as claimed
                (map-set pending-rewards session-id (merge reward {
                  claimed: true,
                  claim-block: (some current-block)
                }))
                
                ;; Update total rewards distributed
                (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) amount))
                
                (ok true)
              )
              failure err-transfer-failed
            )
          )
        )
        ;; STX transfer
        (if (stx-transfer? amount (as-contract tx-sender) player)
          (begin
            ;; Mark as claimed
            (map-set pending-rewards session-id (merge reward {
              claimed: true,
              claim-block: (some current-block)
            }))
            
            ;; Update total rewards distributed
            (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) amount))
            
            (ok true)
          )
          err-transfer-failed
        )
      )
    )
  )
)

;; === DISPUTE SYSTEM ===

;; Open a dispute for a session
(define-public (open-dispute (session-id uint) (reason (buff 16)))
  (let (
    (session (unwrap! (map-get? sessions session-id) err-session-not-found))
    (end-block (get end-block session))
    (current-block burn-block-height)
    (dispute-deadline (+ (unwrap! end-block err-invalid-params) dispute-window-blocks))
  )
    (begin
      ;; Check if dispute window is still open
      (asserts! (>= dispute-deadline current-block) err-dispute-expired)
      
      ;; Check if session is finalized
      (asserts! (is-eq (get status session) "finalized") err-session-closed)
      
      ;; Create dispute record
      (map-set disputes session-id {
        reason: reason,
        disputer: tx-sender,
        dispute-block: current-block,
        resolved: false
      })
      
      ;; Update session status to disputed
      (map-set sessions session-id (merge session {
        status: "disputed"
      }))
      
      (ok true)
    )
  )
)

;; Resolve dispute (owner only)
(define-public (resolve-dispute (session-id uint) (uphold-dispute bool))
  (let (
    (session (unwrap! (map-get? sessions session-id) err-session-not-found))
    (dispute (unwrap! (map-get? disputes session-id) err-invalid-params))
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (not (get resolved dispute)) err-invalid-params)
      
      ;; Mark dispute as resolved
      (map-set disputes session-id (merge dispute {
        resolved: true
      }))
      
      ;; Update session status based on resolution
      (if uphold-dispute
        ;; Dispute upheld - revert session to open
        (map-set sessions session-id (merge session {
          status: "open",
          end-block: none,
          canonical-score: none,
          result-hash: none
        }))
        ;; Dispute rejected - keep session finalized
        (map-set sessions session-id (merge session {
          status: "finalized"
        }))
      )
      
      (ok true)
    )
  )
)

;; === EMERGENCY FUNCTIONS ===

;; Emergency refund (owner only)
(define-public (emergency-refund (session-id uint) (recipient principal) (ft-contract (optional principal)) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
    
    (if (is-some ft-contract)
      (let ((ftc (unwrap! ft-contract err-invalid-params)))
        (contract-call? ftc transfer amount (as-contract tx-sender) recipient none)
      )
      (stx-transfer? amount (as-contract tx-sender) recipient)
    )
  )
)

;; === READ-ONLY QUERIES ===

;; Get dispute information
(define-read-only (get-dispute (session-id uint))
  (map-get? disputes session-id)
)

;; Get trusted server information
(define-read-only (get-trusted-server (pubkey (buff 33)))
  (map-get? trusted-servers pubkey)
)

;; Get game module information
(define-read-only (get-game-module (module-id uint))
  (map-get? game-modules module-id)
)

;; Get contract statistics
(define-read-only (get-contract-stats)
  {
    total-sessions: (var-get session-nonce),
    total-games-played: (var-get total-games-played),
    total-rewards-distributed: (var-get total-rewards-distributed),
    current-block: burn-block-height
  }
)

;; Check if session can be disputed
(define-read-only (can-dispute-session (session-id uint))
  (let (
    (session (map-get? sessions session-id))
    (current-block burn-block-height)
  )
    (if (is-some session)
      (let (
        (s (unwrap-panic session))
        (end-block (get end-block s))
        (status (get status s))
        (dispute-deadline (+ (unwrap! end-block err-invalid-params) dispute-window-blocks))
      )
        (and 
          (is-eq status "finalized")
          (>= dispute-deadline current-block)
          (is-none (map-get? disputes session-id))
        )
      )
      false
    )
  )
)