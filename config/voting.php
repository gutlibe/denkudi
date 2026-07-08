<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Vote Chain Key
    |--------------------------------------------------------------------------
    |
    | HMAC secret used to hash vote chain links and voter participation
    | identifiers. Defaults to APP_KEY so existing votes keep validating
    | unchanged. Set VOTE_CHAIN_KEY explicitly to decouple vote integrity
    | from APP_KEY, so a future APP_KEY rotation doesn't invalidate every
    | historical vote chain or let a student who already voted vote again.
    |
    */

    'chain_key' => env('VOTE_CHAIN_KEY', env('APP_KEY')),

];
