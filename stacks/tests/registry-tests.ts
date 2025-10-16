import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';

Clarinet.test({
  name: 'Registry - Basic functionality tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    // Test registry initialization
    let result = chain.callReadOnlyFn(
      'registry',
      'get-registry-stats',
      [],
      deployer.address
    );
    
    result.result.expectOk().expectTuple()['version'].expectUint(1);
    result.result.expectOk().expectTuple()['total-modules'].expectUint(0);

    // Test game module registration
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-game-module',
        [
          types.ascii('Shooter Game'),
          types.utf8('A fast-paced shooting game with NFT progression'),
          types.ascii('1.0.0'),
          types.principal(deployer.address),
          types.ascii('shooter'),
          types.uint(100),
          types.uint(4)
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectUint(0);

    // Verify module was registered
    result = chain.callReadOnlyFn(
      'registry',
      'get-game-module',
      [types.uint(0)],
      deployer.address
    );
    
    const module = result.result.expectSome().expectTuple();
    module['name'].expectAscii('Shooter Game');
    module['enabled'].expectBool(true);
    module['category'].expectAscii('shooter');

    // Test NFT contract registration
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-nft-contract',
        [
          types.principal(wallet1.address),
          types.ascii('Game Characters'),
          types.ascii('CHAR'),
          types.utf8('Character NFTs for the game'),
          types.ascii('1.0.0'),
          types.list([types.uint(0)])
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify NFT contract was registered
    result = chain.callReadOnlyFn(
      'registry',
      'is-nft-registered',
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    result.result.expectBool(true);

    // Test FT contract registration
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-ft-contract',
        [
          types.principal(wallet2.address),
          types.ascii('Game Tokens'),
          types.ascii('GAME'),
          types.uint(6),
          types.utf8('Game reward tokens'),
          types.ascii('1.0.0'),
          types.list([types.uint(0)])
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Test trusted server registration
    const serverPubkey = types.buff(new Uint8Array(33).fill(1));
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-trusted-server',
        [
          serverPubkey,
          types.ascii('Game Server 1'),
          types.utf8('Primary game server for shooter game'),
          types.list([types.uint(0)])
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify server was registered
    result = chain.callReadOnlyFn(
      'registry',
      'is-trusted-server',
      [serverPubkey],
      deployer.address
    );
    
    result.result.expectBool(true);

    // Test player profile registration
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-player-profile',
        [types.ascii('Player1')],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify profile was created
    result = chain.callReadOnlyFn(
      'registry',
      'get-player-profile',
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    const profile = result.result.expectSome().expectTuple();
    profile['username'].expectAscii('Player1');
    profile['total-games-played'].expectUint(0);

    // Test cross-game session registration
    const sessionHash = types.buff(new Uint8Array(32).fill(2));
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-cross-game-session',
        [
          types.uint(1),
          types.principal(wallet1.address),
          types.uint(0),
          types.some(types.uint(1)),
          sessionHash,
          types.none()
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify session was registered
    result = chain.callReadOnlyFn(
      'registry',
      'get-cross-game-session',
      [types.uint(1)],
      deployer.address
    );
    
    const session = result.result.expectSome().expectTuple();
    session['player'].expectPrincipal(wallet1.address);
    session['game-module-id'].expectUint(0);
    session['nft-used'].expectSome().expectUint(1);
  }
});

Clarinet.test({
  name: 'Registry - Access control tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    // Test unauthorized access
    let result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-game-module',
        [
          types.ascii('Unauthorized Game'),
          types.utf8('This should fail'),
          types.ascii('1.0.0'),
          types.principal(wallet1.address),
          types.ascii('test'),
          types.uint(0),
          types.uint(1)
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(200); // err-unauthorised

    // Test maintenance mode
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'set-maintenance-mode',
        [types.bool(true)],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Try to register during maintenance mode
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-game-module',
        [
          types.ascii('Maintenance Game'),
          types.utf8('This should fail during maintenance'),
          types.ascii('1.0.0'),
          types.principal(deployer.address),
          types.ascii('test'),
          types.uint(0),
          types.uint(1)
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(207); // err-maintenance-mode

    // Disable maintenance mode
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'set-maintenance-mode',
        [types.bool(false)],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: 'Registry - Error handling tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    // Test registering duplicate NFT contract
    let result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-nft-contract',
        [
          types.principal(wallet1.address),
          types.ascii('Duplicate NFT'),
          types.ascii('DUP'),
          types.utf8('This should fail on second attempt'),
          types.ascii('1.0.0'),
          types.list([])
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Try to register the same contract again
    result = chain.mineBlock([
      Tx.contractCall(
        'registry',
        'register-nft-contract',
        [
          types.principal(wallet1.address),
          types.ascii('Duplicate NFT 2'),
          types.ascii('DUP2'),
          types.utf8('This should fail'),
          types.ascii('1.0.0'),
          types.list([])
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(202); // err-already-exists

    // Test querying non-existent module
    result = chain.callReadOnlyFn(
      'registry',
      'get-game-module',
      [types.uint(999)],
      deployer.address
    );
    
    result.result.expectNone();

    // Test querying non-existent session
    result = chain.callReadOnlyFn(
      'registry',
      'get-cross-game-session',
      [types.uint(999)],
      deployer.address
    );
    
    result.result.expectNone();
  }
});
