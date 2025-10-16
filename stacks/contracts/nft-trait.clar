;; nft-trait.clar
;; SIP-009 NFT Standard Interface for Stacks Blockchain
;; 
;; This trait defines the standard interface for NFT contracts
;; that can be used within the multi-game launchpad registry.
;;
;; Features:
;; - Standard NFT operations (mint, transfer, burn)
;; - Metadata management
;; - Batch operations support
;; - Game integration hooks
;; - Ownership verification
;;
;; Compatibility: SIP-009, Clarity v2.1, Stacks 2.5+

;; === TRAIT DEFINITION ===
(define-trait nft-trait
  (
    ;; === READ-ONLY FUNCTIONS ===
    
    ;; Get last token ID, limited to uint range
    (get-last-token-id () (response uint uint))
    
    ;; Get token URI for a given token identifier
    (get-token-uri (uint) (response (optional (string-utf8 256)) uint))
    
    ;; Get owner of a given token identifier
    (get-owner (uint) (response (optional principal) uint))
    
    ;; Get total supply of tokens
    (get-total-supply () (response uint uint))
    
    ;; Get balance of owner
    (get-balance (principal) (response uint uint))
    
    ;; Get supply cap for the NFT contract
    (get-supply-cap () (response uint uint))
    
    ;; === PUBLIC FUNCTIONS ===
    
    ;; Transfer token from one owner to another
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    
    ;; Mint new token to specified owner
    (mint (principal (optional (buff 34))) (response uint uint))
    
    ;; Burn token (remove from circulation)
    (burn (uint principal (optional (buff 34))) (response bool uint))
    
    ;; === GAME INTEGRATION FUNCTIONS ===
    
    ;; Check if token can be used in specific game module
    (can-use-in-game (uint uint) (response bool uint))
    
    ;; Get token stats for game integration
    (get-token-stats (uint) (response (optional {level: uint, exp: uint, durability: uint}) uint))
    
    ;; Update token stats (game modules only)
    (update-token-stats (uint uint uint uint) (response bool uint))
    
    ;; Lock/unlock token for game use
    (set-token-locked (uint bool) (response bool uint))
    
    ;; Check if token is locked
    (is-token-locked (uint) (response bool uint))
    
    ;; === BATCH OPERATIONS ===
    
    ;; Transfer multiple tokens
    (batch-transfer ((list 20 {token-id: uint, sender: principal, recipient: principal, memo: (optional (buff 34))})) (response bool uint))
    
    ;; Mint multiple tokens
    (batch-mint ((list 20 {recipient: principal, memo: (optional (buff 34))})) (response (list 20 uint) uint))
    
    ;; Burn multiple tokens
    (batch-burn ((list 20 {token-id: uint, sender: principal, memo: (optional (buff 34))})) (response bool uint))
    
    ;; === METADATA MANAGEMENT ===
    
    ;; Update token URI
    (update-token-uri (uint (string-utf8 256)) (response bool uint))
    
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
  )
)

;; === EVENTS (for off-chain indexing) ===
;; Token transfer event data structure
;; {token-id: uint, sender: (optional principal), recipient: (optional principal), memo: (optional (buff 34))}

;; Token mint event data structure  
;; {token-id: uint, recipient: principal, memo: (optional (buff 34))}

;; Token burn event data structure
;; {token-id: uint, sender: principal, memo: (optional (buff 34))}

;; Stats update event data structure
;; {token-id: uint, level: uint, exp: uint, durability: uint}

;; Game module registration event data structure
;; {game-module-id: uint, registered: bool}
