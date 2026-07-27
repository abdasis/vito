<?php

namespace App\Enums;

use App\Contracts\VitoEnum;

enum BackupStatus: string implements VitoEnum
{
    case RUNNING = 'running';
    case DELETING = 'deleting';

    public function getColor(): string
    {
        return match ($this) {
            self::RUNNING => 'info',
            self::DELETING => 'warning',
        };
    }

    public function getText(): string
    {
        return $this->value;
    }
}