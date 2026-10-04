# Publicação: Vercel e Supabase

## Atualizado localmente

- Festa: 10/12/2026 às 16h30 (UTC-3). Confirmação até 01/12/2026.
- Av. Frei Cirilo, 4340 — Igreja de Jesus Cristo dos Santos dos Últimos Dias.
- Segunda lista: apenas nome, foto e reserva, sem preço ou link de loja.
- Nome, telefone e mensagem de quem reserva não são retornados na lista pública de produtos.
- Removidos os scripts de monitoramento/gravação de sessão PostHog e Emergent do HTML público.
- A API exige autenticação administrativa para editar presentes, cancelar reservas e listar convidados.
- Testes automatizados cobrem concorrência, persistência, presentes sem loja e permissões de acesso.

## Ainda não publicado nem conectado ao Supabase

O backend atual usa SQLite local (com opção MongoDB). Ele ainda NÃO possui integração PostgreSQL/Supabase. Publicar somente o frontend na Vercel não liga o banco automaticamente.

Próxima etapa: criar/selecionar um projeto Supabase separado, confirmar o projeto de destino na Vercel e implementar a integração. Não usar o banco de outro aplicativo. Nunca colocar senha de banco, JWT_SECRET ou chave service_role/secret no frontend, nem enviar esses segredos no chat.

Antes da publicação precisamos configurar políticas de acesso no banco, reserva atômica, autenticação administrativa, variáveis de ambiente, origens permitidas e proteção contra abuso (tentativas de login e envios repetidos). Esses controles da produção ainda não estão configurados. O formulário de reserva atual não verifica a posse do telefone.

## Backup local

Na raiz Casamento:

```powershell
.\backend\.venv\Scripts\python.exe backend/backup_local.py
```

O backup consistente, com verificação de integridade, fica em backend/data/backups. A pasta é ignorada pelo Git e não fica na pasta pública. Contém dados pessoais e deve ser guardada em local privado. Uma cópia no mesmo computador não protege contra perda do equipamento: mantenha também uma cópia segura externa. Esse comando não é um agendamento nem faz backup do futuro Supabase.

## Após publicar (pendente)

- Verificar HTTPS, segredos ausentes do bundle e restrições de acesso direto no Supabase.
- Testar login correto/incorreto, expiração de sessão e acesso sem login.
- Reservar um item de teste por dois navegadores simultaneamente; somente um deve conseguir.
- Reservar outro item com o mesmo telefone; deve funcionar.
- Confirmar presença e conferir no painel; reiniciar o backend e verificar persistência.
- Testar em celular real: menu, fotos locais, carrosséis, popup, teclado e envio de formulários.
- Configurar e testar backup/restauração do banco remoto, incluindo periodicidade e retenção.
- Remover apenas dados fictícios criados para os testes, não reservas reais.

Esta revisão não substitui os testes no ambiente publicado; eles ainda dependem da implantação.
