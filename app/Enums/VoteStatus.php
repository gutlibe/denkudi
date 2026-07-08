<?php

namespace App\Enums;

enum VoteStatus: string
{
    case Valid = 'valid';
    case Quarantined = 'quarantined';
}
