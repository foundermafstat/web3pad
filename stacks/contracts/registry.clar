;; ============================================================
;;  W3P Registry v2 — Modular Multi-Game System Registry
;; ============================================================
;;  Compatible with Stacks 2.5+ and Clarity v2.1
;; ============================================================

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID (err u103))
(define-constant ERR_DISABLED (err u104))
(define-constant ERR_LIMIT_REACHED (err u105))
(define-constant ERR_MAINTENANCE (err u106))

(define-data-var contract-owner principal tx-sender)
(define-data-var maintainer (optional principal) none)
(define-data-var maintenance-mode bool false)

(define-data-var entity-nonce uint u0)
(define-data-var total-entities uint u0)
(define-constant MAX_ENTITIES u5000)

;; ============================================================
;; ENTITY MODEL
;; ============================================================

(define-map registry
  uint ;; entity-id
  {
    entity-type: (string-ascii 16), ;; e.g. "game", "nft", "ft", "server", "profile"
    name: (string-ascii 64),
    description: (string-utf8 256),
    owner: principal,
    address: (optional principal),
    chain: (optional (string-ascii 16)), ;; "Stacks", "Ethereum", "TON", etc.
    protocol: (optional (string-ascii 32)), ;; e.g. "SIP-009", "SIP-010"
    external-id: (optional (buff 32)),
    enabled: bool,
    created-block: uint,
    updated-block: uint,
    linked-modules: (list 50 uint)
  }
)

;; ============================================================
;; TRUSTED SERVERS MAP (Off-chain authorities)
;; ============================================================

(define-map trusted-servers
  (buff 33) ;; compressed secp256k1 public key
  {
    name: (string-ascii 64),
    enabled: bool,
    owner: principal,
    last-active: uint,
    reputation: uint
  }
)

;; ============================================================
;; === ACCESS CONTROL HELPERS ===
;; ============================================================

(define-read-only (is-owner (who principal))
  (is-eq who (var-get contract-owner))
)

(define-read-only (is-maintainer (who principal))
  (match (var-get maintainer)
    maint (is-eq who maint)
    false
  )
)

(define-read-only (is-trusted-server (pubkey (buff 33)))
  (default-to false (get enabled (map-get? trusted-servers pubkey)))
)

(define-read-only (in-maintenance-mode)
  (var-get maintenance-mode)
)

(define-read-only (next-entity-id)
  (var-get entity-nonce)
)

;; ============================================================
;; === ADMIN CONTROLS ===
;; ============================================================

(define-public (set-maintainer (new-maintainer principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
    (var-set maintainer (some new-maintainer))
    (ok new-maintainer)
  )
)

(define-public (toggle-maintenance (enabled bool))
  (begin
    (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
    (var-set maintenance-mode enabled)
    (ok enabled)
  )
)

;; ============================================================
;; === ENTITY REGISTRATION ===
;; ============================================================

(define-public (register-entity
  (entity-type (string-ascii 16))
  (name (string-ascii 64))
  (description (string-utf8 256))
  (address (optional principal))
  (chain (optional (string-ascii 16)))
  (protocol (optional (string-ascii 32)))
  (external-id (optional (buff 32)))
)
  (let (
    (id (var-get entity-nonce))
    (block burn-block-height)
  )
    (begin
      (asserts! (not (var-get maintenance-mode)) ERR_MAINTENANCE)
      (asserts! (<= id MAX_ENTITIES) ERR_LIMIT_REACHED)

      (map-set registry id {
        entity-type: entity-type,
        name: name,
        description: description,
        owner: tx-sender,
        address: address,
        chain: chain,
        protocol: protocol,
        external-id: external-id,
        enabled: true,
        created-block: block,
        updated-block: block,
        linked-modules: (list)
      })

      (var-set entity-nonce (+ id u1))
      (var-set total-entities (+ (var-get total-entities) u1))
      (ok id)
    )
  )
)

;; ============================================================
;; === ENTITY MANAGEMENT ===
;; ============================================================

(define-public (update-entity
  (id uint)
  (name (string-ascii 64))
  (description (string-utf8 256))
  (enabled bool)
)
  (let ((entity (unwrap! (map-get? registry id) ERR_NOT_FOUND)))
    (begin
      (asserts! (or (is-owner tx-sender) (is-maintainer tx-sender)) ERR_UNAUTHORIZED)

      (map-set registry id (merge entity {
        name: name,
        description: description,
        enabled: enabled,
        updated-block: burn-block-height
      }))

      (ok true)
    )
  )
)

(define-public (link-modules (id uint) (modules (list 50 uint)))
  (let ((entity (unwrap! (map-get? registry id) ERR_NOT_FOUND)))
    (begin
      (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
      (map-set registry id (merge entity {linked-modules: modules}))
      (ok true)
    )
  )
)

;; ============================================================
;; === TRUSTED SERVERS MANAGEMENT ===
;; ============================================================

(define-public (register-server (pubkey (buff 33)) (name (string-ascii 64)))
  (let ((exists (map-get? trusted-servers pubkey)))
    (begin
      (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
      (asserts! (is-none exists) ERR_ALREADY_EXISTS)

      (map-set trusted-servers pubkey {
        name: name,
        enabled: true,
        owner: tx-sender,
        last-active: burn-block-height,
        reputation: u100
      })
      (ok true)
    )
  )
)

(define-public (server-heartbeat (pubkey (buff 33)))
  (let ((srv (unwrap! (map-get? trusted-servers pubkey) ERR_NOT_FOUND)))
    (begin
      (asserts! (is-owner tx-sender) ERR_UNAUTHORIZED)
      (map-set trusted-servers pubkey (merge srv {
        last-active: burn-block-height,
        reputation: (min u100 (+ (get reputation srv) u1))
      }))
      (ok true)
    )
  )
)

;; ============================================================
;; === READ FUNCTIONS ===
;; ============================================================

(define-read-only (get-entity (id uint))
  (map-get? registry id)
)

(define-read-only (get-entity-summary)
  {
    total: (var-get total-entities),
    next-id: (var-get entity-nonce),
    maintenance: (var-get maintenance-mode),
    block: burn-block-height
  }
)

(define-read-only (list-enabled-entities (type (string-ascii 16)) (limit uint))
  ;; Simplified prototype for indexer integration — to be implemented with pagination off-chain
  (list)
)
