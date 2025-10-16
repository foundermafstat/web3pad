;; ft-trait.clar
;; SIP-010 Fungible Token Standard Interface for Stacks Blockchain
;; 
;; This trait defines the standard interface for FT contracts
;; that can be used within the multi-game launchpad registry.
;;
;; Features:
;; - Standard FT operations (transfer, mint, burn)
;; - Metadata management
;; - Batch operations support
;; - Game integration hooks
;; - Balance tracking
;;
;; Compatibility: SIP-010, Clarity v2.1, Stacks 2.5+

;; === TRAIT DEFINITION ===
(define-trait ft-trait
  (
    ;; === READ-ONLY FUNCTIONS ===
    
    ;; Get token name
    (get-name () (response (string-ascii 32) uint))
    
    ;; Get token symbol
    (get-symbol () (response (string-ascii 32) uint))
    
    ;; Get token decimals
    (get-decimals () (response uint uint))
    
    ;; Get token total supply
    (get-total-supply () (response uint uint))
    
    ;; Get balance of owner
    (get-balance (principal) (response uint uint))
    
    ;; Get token URI for metadata
    (get-token-uri () (response (optional (string-utf8 256)) uint))
    
    ;; Get supply cap for the FT contract
    (get-supply-cap () (response uint uint))
    
    ;; === PUBLIC FUNCTIONS ===
    
    ;; Transfer tokens from sender to recipient
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    
    ;; Mint new tokens to specified owner
    (mint (uint principal (optional (buff 34))) (response bool uint))
    
    ;; Burn tokens from owner's balance
    (burn (uint principal (optional (buff 34))) (response bool uint))
    
    ;; === GAME INTEGRATION FUNCTIONS ===
    
    ;; Check if token can be used in specific game module
    (can-use-in-game (uint) (response bool uint))
    
    ;; Get token metadata for game integration
    (get-token-metadata () (response {name: (string-ascii 32), symbol: (string-ascii 32), decimals: uint, total-supply: uint} uint))
    
    ;; Lock/unlock token for game use
    (set-token-locked (bool) (response bool uint))
    
    ;; Check if token is locked
    (is-token-locked () (response bool uint))
    
    ;; === BATCH OPERATIONS ===
    
    ;; Transfer tokens to multiple recipients
    (batch-transfer ((list 20 {amount: uint, sender: principal, recipient: principal, memo: (optional (buff 34))})) (response bool uint))
    
    ;; Mint tokens to multiple recipients
    (batch-mint ((list 20 {amount: uint, recipient: principal, memo: (optional (buff 34))})) (response bool uint))
    
    ;; Burn tokens from multiple owners
    (batch-burn ((list 20 {amount: uint, owner: principal, memo: (optional (buff 34))})) (response bool uint))
    
    ;; === METADATA MANAGEMENT ===
    
    ;; Update token URI
    (update-token-uri ((string-utf8 256)) (response bool uint))
    
    ;; Get contract metadata
    (get-contract-uri () (response (optional (string-utf8 256)) uint))
    
    ;; Update contract metadata
    (update-contract-uri ((string-utf8 256)) (response bool uint))
    
    ;; === OWNERSHIP AND ACCESS CONTROL ===
    
    ;; Check if address is contract owner
    (is-contract-owner (principal) (response bool uint))
    
    ;; Transfer contract ownership
    (transfer-contract-ownership (principal) (response bool uint))
    
    ;; === GAME MODULE INTEGRATION ===
    
    ;; Register game module for token usage
    (register-game-module (uint) (response bool uint))
    
    ;; Unregister game module
    (unregister-game-module (uint) (response bool uint))
    
    ;; Get list of supported game modules
    (get-supported-game-modules () (response (list 100 uint) uint))
    
    ;; === REWARD SYSTEM INTEGRATION ===
    
    ;; Create reward pool for game module
    (create-reward-pool (uint uint) (response bool uint))
    
    ;; Distribute rewards from pool
    (distribute-rewards (uint (list 20 {recipient: principal, amount: uint})) (response bool uint))
    
    ;; Get reward pool balance
    (get-reward-pool-balance (uint) (response uint uint))
    
    ;; === STAKING INTEGRATION ===
    
    ;; Stake tokens for game module
    (stake (uint uint) (response bool uint))
    
    ;; Unstake tokens
    (unstake (uint uint) (response bool uint))
    
    ;; Get staked balance for owner and game module
    (get-staked-balance (principal uint) (response uint uint))
  )
)

;; === EVENTS (for off-chain indexing) ===

;; Token transfer event data structure
;; {amount: uint, sender: (optional principal), recipient: (optional principal), memo: (optional (buff 34))}

;; Token mint event data structure
;; {amount: uint, recipient: principal, memo: (optional (buff 34))}

;; Token burn event data structure
;; {amount: uint, owner: principal, memo: (optional (buff 34))}

;; Game module registration event data structure
;; {game-module-id: uint, registered: bool}

;; Reward pool creation event data structure
;; {game-module-id: uint, initial-amount: uint}

;; Reward distribution event data structure
;; {game-module-id: uint, total-distributed: uint, recipients-count: uint}

;; Staking event data structure
;; {game-module-id: uint, owner: principal, amount: uint, staked: bool}
