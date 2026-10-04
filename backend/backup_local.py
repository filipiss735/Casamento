"""Create a consistent private SQLite backup without stopping the local API."""
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


def backup_database(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if source == destination or destination.exists():
        raise ValueError('O destino deve ser um arquivo novo, diferente da origem.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    original = sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)
    copy = sqlite3.connect(destination)
    try:
        original.backup(copy)
        if copy.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise RuntimeError('Falha na verificação do backup')
    finally:
        copy.close()
        original.close()
    return destination


if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    stamp = datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S-%f')
    path = backup_database(root / 'data/casamento.sqlite3', root / 'data/backups' / f'casamento-{stamp}.sqlite3')
    print(f'Backup local criado e verificado: {path}')
