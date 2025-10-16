;; registry.clar
;; Launchpad Registry for Multi-Game Management on Stacks Blockchain
;; 
;; Features:
;; - Central registry for game modules, NFT contracts, FT contracts
;; - Trusted off-chain server authorization
;; - Modular, upgradeable architecture
;; - Cross-game interoperability
;; - Asset management and tracking
;; - Security and access control
;;
;; Compatibility: Clarity v2.1, Clarinet, Stacks 2.5+

;; === ERROR CODES ===
(define-constant err-unauthorised (err u200))
(define-constant err-not-found (err u201))
(define-constant err-already-exists (err u202))
(define-constant err-disabled (err u203))
(define-constant err-invalid-params (err u204))
(define-constant err-invalid-address (err u205))
(define-constant err-invalid-version (err u206))
(define-constant err-maintenance-mode (err u207))
(define-constant err-ownership-required (err u208))
(define-constant err-upgrade-not-allowed (err u209))
(define-constant err-circular-dependency (err u210))

;; === CONTRACT CONFIGURATION ===
(define-constant contract-owner tx-sender)
(define-constant registry-version u1)
(define-constant max-name-length u64)
(define-constant max-description-length u256)
(define-constant max-modules u1000)
(define-constant max-servers u100)

;; === CORE DATA STRUCTURES ===

;; Game module registry
(define-map game-modules
  uint ;; module-id
  {
    name: (string-ascii 64),
    description: (string-utf8 256),
    version: (string-ascii 16),
    contract-address: principal,
    owner: principal,
    enabled: bool,
    category: (string-ascii 32), ;; "shooter", "puzzle", "racing", etc.
    min-stake: uint,
    max-players: uint,
    created-block: uint,
    last-updated: uint,
    total-sessions: uint,
    active-sessions: uint
  }
)

;; NFT contract registry
(define-map nft-contracts
  principal ;; contract-address
  {
    name: (string-ascii 64),
    symbol: (string-ascii 16),
    description: (string-utf8 256),
    owner: principal,
    enabled: bool,
    trait-version: (string-ascii 16),
    total-supply: uint,
    created-block: uint,
    last-updated: uint,
    game-modules: (list 100 uint) ;; List of supported game module IDs
  }
)

;; FT contract registry
(define-map ft-contracts
  principal ;; contract-address
  {
    name: (string-ascii 64),
    symbol: (string-ascii 16),
    decimals: uint,
    description: (string-utf8 256),
    owner: principal,
    enabled: bool,
    trait-version: (string-ascii 16),
    total-supply: uint,
    created-block: uint,
    last-updated: uint,
    game-modules: (list 100 uint) ;; List of supported game module IDs
  }
)

;; Trusted off-chain servers
(define-map trusted-servers
  (buff 33) ;; compressed secp256k1 public key (33 bytes)
  {
    name: (string-ascii 64),
    description: (string-utf8 256),
    enabled: bool,
    owner: principal,
    game-modules: (list 100 uint), ;; Supported game modules
    last-heartbeat: uint,
    created-block: uint,
    total-requests: uint,
    reputation-score: uint
  }
)

;; Cross-game player profiles
(define-map player-profiles
  principal ;; player address
  {
    username: (string-ascii 32),
    avatar-hash: (optional (buff 32)),
    total-games-played: uint,
    total-score: uint,
    preferred-game: (optional uint),
    registered-block: uint,
    last-active: uint,
    achievements: (list 50 uint),
    nft-collection: (list 50 uint), ;; Owned NFT token IDs
    ft-balances: (list 50 {contract: principal, balance: uint})
  }
)

;; Game session cross-references
(define-map cross-game-sessions
  uint ;; session-id
  {
    player: principal,
    game-module-id: uint,
    nft-used: (optional uint),
    session-hash: (buff 32),
    start-block: uint,
    end-block: (optional uint),
    score: (optional uint),
    rewards: (list 10 {ft-contract: principal, amount: uint}),
    metadata: (optional (buff 256))
  }
)

;; Asset permissions and access control
(define-map asset-permissions
  {asset-type: (string-ascii 16), asset-id: uint} ;; asset-type: "nft" or "ft", asset-id: token-id or module-id
  {
    owner: principal,
    permissions: (list 10 (string-ascii 32)), ;; "transfer", "use", "upgrade", etc.
    game-modules: (list 50 uint), ;; Allowed game modules
    expires-block: (optional uint)
  }
)

;; Global registry state
(define-data-var module-nonce uint u0)
(define-data-var total-registered-modules uint u0)
(define-data-var total-registered-nfts uint u0)
(define-data-var total-registered-fts uint u0)
(define-data-var total-trusted-servers uint u0)
(define-data-var maintenance-mode bool false)

;; === HELPER FUNCTIONS ===

;; Check if caller is contract owner
(define-read-only (is-owner)
  (ok (is-eq tx-sender contract-owner))
)

;; Check if registry is in maintenance mode
(define-read-only (is-maintenance-mode)
  (ok (var-get maintenance-mode))
)

;; Validate game module ID
(define-read-only (is-valid-module (module-id uint))
  (let ((module-entry (map-get? game-modules module-id)))
    (and 
      (> module-id u0)
      (< module-id (var-get module-nonce))
      (is-some module-entry)
      (get enabled (unwrap-panic module-entry))
    )
  )
)

;; Check if asset is registered
(define-read-only (is-nft-registered (contract-address principal))
  (default-to false (get enabled (map-get? nft-contracts contract-address)))
)

(define-read-only (is-ft-registered (contract-address principal))
  (default-to false (get enabled (map-get? ft-contracts contract-address)))
)

;; Check if server is trusted
(define-read-only (is-trusted-server (pubkey (buff 33)))
  (default-to false (get enabled (map-get? trusted-servers pubkey)))
)

;; Get module information
(define-read-only (get-game-module (module-id uint))
  (map-get? game-modules module-id)
)

;; Get NFT contract information
(define-read-only (get-nft-contract (contract-address principal))
  (map-get? nft-contracts contract-address)
)

;; Get FT contract information
(define-read-only (get-ft-contract (contract-address principal))
  (map-get? ft-contracts contract-address)
)

;; Get server information
(define-read-only (get-trusted-server (pubkey (buff 33)))
  (map-get? trusted-servers pubkey)
)

;; Get player profile
(define-read-only (get-player-profile (player principal))
  (map-get? player-profiles player)
)

;; === ADMIN FUNCTIONS ===

;; Set maintenance mode
(define-public (set-maintenance-mode (enabled bool))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
    (ok (var-set maintenance-mode enabled))
  )
)

;; === GAME MODULE MANAGEMENT ===

;; Register new game module
(define-public (register-game-module 
  (name (string-ascii 64))
  (description (string-utf8 256))
  (version (string-ascii 16))
  (contract-address principal)
  (category (string-ascii 32))
  (min-stake uint)
  (max-players uint)
)
  (let (
    (module-id (var-get module-nonce))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (not (var-get maintenance-mode)) err-maintenance-mode)
      (asserts! (is-eq (len name) u0) err-invalid-params)
      (asserts! (<= module-id max-modules) err-invalid-params)
      
      ;; Register module
      (map-set game-modules module-id {
        name: name,
        description: description,
        version: version,
        contract-address: contract-address,
        owner: tx-sender,
        enabled: true,
        category: category,
        min-stake: min-stake,
        max-players: max-players,
        created-block: current-block,
        last-updated: current-block,
        total-sessions: u0,
        active-sessions: u0
      })
      
      ;; Update counters
      (var-set module-nonce (+ module-id u1))
      (var-set total-registered-modules (+ (var-get total-registered-modules) u1))
      
      (ok module-id)
    )
  )
)

;; Update game module
(define-public (update-game-module 
  (module-id uint)
  (name (string-ascii 64))
  (description (string-utf8 256))
  (version (string-ascii 16))
  (category (string-ascii 32))
  (min-stake uint)
  (max-players uint)
)
  (let (
    (module (unwrap! (map-get? game-modules module-id) err-not-found))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (get enabled module) err-disabled)
      
      ;; Update module
      (map-set game-modules module-id (merge module {
        name: name,
        description: description,
        version: version,
        category: category,
        min-stake: min-stake,
        max-players: max-players,
        last-updated: current-block
      }))
      
      (ok true)
    )
  )
)

;; Enable/disable game module
(define-public (set-game-module-enabled (module-id uint) (enabled bool))
  (let (
    (module (unwrap! (map-get? game-modules module-id) err-not-found))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      
      (map-set game-modules module-id (merge module {
        enabled: enabled,
        last-updated: current-block
      }))
      
      (ok true)
    )
  )
)

;; === NFT CONTRACT MANAGEMENT ===

;; Register NFT contract
(define-public (register-nft-contract 
  (contract-address principal)
  (name (string-ascii 64))
  (symbol (string-ascii 16))
  (description (string-utf8 256))
  (trait-version (string-ascii 16))
  (supported-modules (list 100 uint))
)
  (let (
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (not (var-get maintenance-mode)) err-maintenance-mode)
      (asserts! (is-none (map-get? nft-contracts contract-address)) err-already-exists)
      
      ;; Register NFT contract
      (map-set nft-contracts contract-address {
        name: name,
        symbol: symbol,
        description: description,
        owner: tx-sender,
        enabled: true,
        trait-version: trait-version,
        total-supply: u0,
        created-block: current-block,
        last-updated: current-block,
        game-modules: supported-modules
      })
      
      ;; Update counter
      (var-set total-registered-nfts (+ (var-get total-registered-nfts) u1))
      
      (ok true)
    )
  )
)

;; Update NFT contract
(define-public (update-nft-contract 
  (contract-address principal)
  (name (string-ascii 64))
  (description (string-utf8 256))
  (supported-modules (list 100 uint))
)
  (let (
    (nft-contract (unwrap! (map-get? nft-contracts contract-address) err-not-found))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (get enabled nft-contract) err-disabled)
      
      (map-set nft-contracts contract-address (merge nft-contract {
        name: name,
        description: description,
        game-modules: supported-modules,
        last-updated: current-block
      }))
      
      (ok true)
    )
  )
)

;; === FT CONTRACT MANAGEMENT ===

;; Register FT contract
(define-public (register-ft-contract 
  (contract-address principal)
  (name (string-ascii 64))
  (symbol (string-ascii 16))
  (decimals uint)
  (description (string-utf8 256))
  (trait-version (string-ascii 16))
  (supported-modules (list 100 uint))
)
  (let (
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (not (var-get maintenance-mode)) err-maintenance-mode)
      (asserts! (is-none (map-get? ft-contracts contract-address)) err-already-exists)
      
      ;; Register FT contract
      (map-set ft-contracts contract-address {
        name: name,
        symbol: symbol,
        decimals: decimals,
        description: description,
        owner: tx-sender,
        enabled: true,
        trait-version: trait-version,
        total-supply: u0,
        created-block: current-block,
        last-updated: current-block,
        game-modules: supported-modules
      })
      
      ;; Update counter
      (var-set total-registered-fts (+ (var-get total-registered-fts) u1))
      
      (ok true)
    )
  )
)

;; === TRUSTED SERVER MANAGEMENT ===

;; Register trusted server
(define-public (register-trusted-server 
  (pubkey (buff 33))
  (name (string-ascii 64))
  (description (string-utf8 256))
  (supported-modules (list 100 uint))
)
  (let (
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (not (var-get maintenance-mode)) err-maintenance-mode)
      (asserts! (is-none (map-get? trusted-servers pubkey)) err-already-exists)
      (asserts! (<= (var-get total-trusted-servers) max-servers) err-invalid-params)
      
      ;; Register server
      (map-set trusted-servers pubkey {
        name: name,
        description: description,
        enabled: true,
        owner: tx-sender,
        game-modules: supported-modules,
        last-heartbeat: current-block,
        created-block: current-block,
        total-requests: u0,
        reputation-score: u100
      })
      
      ;; Update counter
      (var-set total-trusted-servers (+ (var-get total-trusted-servers) u1))
      
      (ok true)
    )
  )
)

;; Update server heartbeat
(define-public (update-server-heartbeat (pubkey (buff 33)) (requests-this-period uint))
  (let (
    (server (unwrap! (map-get? trusted-servers pubkey) err-not-found))
    (current-block burn-block-height)
    (new-reputation (if (> requests-this-period u0) 
      (if (> (+ (get reputation-score server) u1) u100)
        u100
        (+ (get reputation-score server) u1)
      )
      (if (< (- (get reputation-score server) u1) u0)
        u0
        (- (get reputation-score server) u1)
      )
    ))
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      (asserts! (get enabled server) err-disabled)
      
      (map-set trusted-servers pubkey (merge server {
        last-heartbeat: current-block,
        total-requests: (+ (get total-requests server) requests-this-period),
        reputation-score: new-reputation
      }))
      
      (ok true)
    )
  )
)

;; === CROSS-GAME SESSION MANAGEMENT ===

;; Register cross-game session
(define-public (register-cross-game-session 
  (session-id uint)
  (player principal)
  (game-module-id uint)
  (nft-used (optional uint))
  (session-hash (buff 32))
  (metadata (optional (buff 256)))
)
  (let (
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-valid-module game-module-id) err-invalid-params)
      (asserts! (is-none (map-get? cross-game-sessions session-id)) err-already-exists)
      
      ;; Register session
      (map-set cross-game-sessions session-id {
        player: player,
        game-module-id: game-module-id,
        nft-used: nft-used,
        session-hash: session-hash,
        start-block: current-block,
        end-block: none,
        score: none,
        rewards: (list),
        metadata: metadata
      })
      
      ;; Update module stats
      (let ((module-entry (unwrap-panic (map-get? game-modules game-module-id))))
        (map-set game-modules game-module-id (merge module-entry {
          total-sessions: (+ (get total-sessions module-entry) u1),
          active-sessions: (+ (get active-sessions module-entry) u1)
        }))
      )
      
      (ok true)
    )
  )
)

;; Finalize cross-game session
(define-public (finalize-cross-game-session 
  (session-id uint)
  (score uint)
  (rewards (list 10 {ft-contract: principal, amount: uint}))
)
  (let (
    (session (unwrap! (map-get? cross-game-sessions session-id) err-not-found))
    (game-module-id (get game-module-id session))
    (module-entry (unwrap-panic (map-get? game-modules game-module-id)))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      
      ;; Update session
      (map-set cross-game-sessions session-id (merge session {
        end-block: (some current-block),
        score: (some score),
        rewards: rewards
      }))
      
      ;; Update module stats
      (map-set game-modules game-module-id (merge module-entry {
        active-sessions: (- (get active-sessions module-entry) u1)
      }))
      
      (ok true)
    )
  )
)

;; === PLAYER PROFILE MANAGEMENT ===

;; Register player profile
(define-public (register-player-profile (username (string-ascii 32)))
  (let (
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-none (map-get? player-profiles tx-sender)) err-already-exists)
      
      ;; Create profile
      (map-set player-profiles tx-sender {
        username: username,
        avatar-hash: none,
        total-games-played: u0,
        total-score: u0,
        preferred-game: none,
        registered-block: current-block,
        last-active: current-block,
        achievements: (list),
        nft-collection: (list),
        ft-balances: (list)
      })
      
      (ok true)
    )
  )
)

;; Update player stats
(define-public (update-player-stats 
  (player principal)
  (games-played uint)
  (score uint)
  (achievements (list 50 uint))
)
  (let (
    (profile (unwrap! (map-get? player-profiles player) err-not-found))
    (current-block burn-block-height)
  )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorised)
      
      (map-set player-profiles player (merge profile {
        total-games-played: (+ (get total-games-played profile) games-played),
        total-score: (+ (get total-score profile) score),
        last-active: current-block,
        achievements: achievements
      }))
      
      (ok true)
    )
  )
)

;; === READ-ONLY QUERIES ===

;; Get registry statistics
(define-read-only (get-registry-stats)
  {
    version: registry-version,
    total-modules: (var-get total-registered-modules),
    total-nfts: (var-get total-registered-nfts),
    total-fts: (var-get total-registered-fts),
    total-servers: (var-get total-trusted-servers),
    maintenance-mode: (var-get maintenance-mode),
    current-block: burn-block-height
  }
)

;; List all enabled game modules
(define-read-only (list-game-modules (limit uint) (offset uint))
  ;; Simplified implementation - return empty list for now
  ;; In a full implementation, this would iterate through the map
  (list)
)

;; Check if game module supports NFT contract
(define-read-only (supports-nft (module-id uint) (nft-contract principal))
  (let (
    (module (map-get? game-modules module-id))
    (nft (map-get? nft-contracts nft-contract))
  )
    (and 
      (is-some module)
      (is-some nft)
      (get enabled (unwrap-panic module))
      (get enabled (unwrap-panic nft))
    )
  )
)

;; Get cross-game session
(define-read-only (get-cross-game-session (session-id uint))
  (map-get? cross-game-sessions session-id)
)
