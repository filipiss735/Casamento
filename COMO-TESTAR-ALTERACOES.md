# Site de Filipi e Larissa

Atualização de 04/10: festa em 10/12/2026 às 16h30, confirmação até 01/12. Consulte PUBLICACAO-PENDENCIAS.md para o estado atual da publicação e segurança. A segunda lista agora é somente para reserva: preço e link não são necessários.

## Iniciar no computador

Na pasta Casamento, abra dois terminais PowerShell e mantenha ambos abertos:

Terminal 1 (banco/API): `powershell -ExecutionPolicy Bypass -File .\INICIAR-API.ps1`

Terminal 2 (site): `powershell -ExecutionPolicy Bypass -File .\INICIAR-SITE.ps1`

Acesse http://localhost:3000. Se outra versão ocupar essa porta, pare o terminal antigo com Ctrl+C e inicie novamente. Não use Live Server.

O ambiente Python já foi instalado neste computador. Em outro computador com Python instalado, execute na raiz:

```powershell
py -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements-runtime.txt
cd frontend
npm ci
```

Configure backend/.env com ADMIN_EMAIL, ADMIN_PASSWORD e JWT_SECRET seguros. backend/.env.local seleciona DB_DRIVER=sqlite para uso local. Nunca publique esses arquivos ou o banco.

## Alterar os presentes

- Primeira linha: frontend/src/data/featuredGifts.js (os 39 produtos existentes foram preservados).
- Segunda linha: frontend/src/data/premiumGifts.js (presentes somente para reserva).
- Na segunda linha, preencha title e image e deixe placeholder como false (ou omita esse campo). Preço e link são opcionais e não serão mostrados nessa lista. Na primeira linha, mantenha preço e link da loja.
- Mantenha o id estável e único: a reserva pertence a esse identificador.
- Pare e reinicie INICIAR-API.ps1 após editar. Ele sincroniza o catálogo. npm start e npm run build também geram o catálogo, mas a API precisa reiniciar para lê-lo.
- Os campos dos produtos definidos nesses arquivos são reaplicados ao reiniciar a API; reservas nunca são apagadas por essa sincronização. Prefira editar esses produtos no arquivo, não no painel. Novos produtos criados apenas no painel ficam no banco.
- Retirar um produto do arquivo não apaga seu histórico no banco: remova também pelo painel se realmente quiser excluí-lo. Um produto ainda presente no arquivo será recriado ao reiniciar.
- Os exemplos não podem ser reservados e não possuem fotos ou preços fictícios.

## Reservas e confirmações

Clique em “meu presente é esse”, informe nome completo, telefone com DDD e mensagem opcional. O sucesso só aparece depois da gravação no servidor. O item fica cinza, indisponível e sem link de compra público. A pessoa que reservou recebe o link da loja no popup de sucesso; a reserva não realiza a compra nem impede alguém de comprar diretamente fora do site.

Uma pessoa pode reservar vários produtos diferentes. Um mesmo produto só aceita uma reserva, inclusive em cliques simultâneos. A lista atualiza a cada dez segundos e ao voltar à janela; uma tentativa com a lista desatualizada é rejeitada pelo servidor.

O painel /admin usa as credenciais de backend/.env. Consulte “Reservas de presentes” para nomes, telefones e mensagens, e “Confirmações” para presenças e acompanhantes. Telefone e mensagem da reserva não aparecem na API pública. Para cancelar uma reserva, use “Liberar presente” na aba Presentes.

Dados locais ficam em backend/data/casamento.sqlite3. Faça backup com a API parada. Fechar ou reiniciar o navegador não apaga os dados. Se a API estiver desligada, o site informa erro e não simula sucesso.

## Verificar

1. Veja as fotos completas em Nossa História, menu branco, ausência da faixa de mensagens, data 02/11/2026 às 16h30 e os dois carrosséis.
2. Reserve um produto de teste; tente reservá-lo em outra janela. Ele deve estar indisponível. Depois libere pelo painel.
3. Com o mesmo telefone, reserve outro produto: isso é permitido.
4. Envie uma confirmação e confira no painel. Exclua sua confirmação de teste depois.
5. Reinicie a API: reservas e confirmações devem continuar salvas.

Testes automatizados usam um banco temporário, separado dos dados reais:

```powershell
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements-test.txt
$env:PYTHONUTF8 = '1'
.\backend\.venv\Scripts\python.exe -m pytest backend/test_reservations.py -q
cd frontend
npm run build
```

## Publicação

Ainda é uma configuração local, não uma publicação. Hospedar somente a pasta build não fornece o banco/API. A hospedagem deve disponibilizar /api (ou definir REACT_APP_BACKEND_URL antes do build), manter o backend ativo e usar disco persistente para SQLite ou configurar MongoDB. Em produção, não envie .env.local de desenvolvimento; configure DB_DRIVER e demais variáveis na hospedagem. Inclua catalog.generated.json gerado pelo build no backend. Não exponha banco, credenciais ou dados pessoais como arquivos públicos. Configure HTTPS e backups antes de compartilhar com convidados.
