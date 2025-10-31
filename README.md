# 🔗 Encurtador de Links - Cloudflare Workers + N8N

![Licença MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)
![N8N](https://img.shields.io/badge/N8N-Workflow-red)

Sistema completo de encurtamento de URLs usando Cloudflare Workers e N8N. Gratuito, profissional e com contador de cliques em tempo real.

**Desenvolvido por [U.ai Automação](https://uaiautomacao.com)**

---

## ✨ Features

- ✅ **Links Curtos Personalizados** - Use seu próprio domínio
- ✅ **Contador de Cliques** - Rastreie acessos em tempo real
- ✅ **Sem Cache** - Redirects instantâneos
- ✅ **Páginas de Erro Personalizadas** - 404 com sua marca
- ✅ **Banco de Dados Flexível** - Use PostgreSQL, MySQL, MongoDB, Data Tables, etc
- ✅ **100% Gratuito** - Usando limites gratuitos da Cloudflare e N8N
- ✅ **Open Source** - Licença MIT

---

## 📖 Documentação Completa

**[Acesse a documentação completa aqui](https://encurtador.uaiautomacao.com)**

A documentação inclui:
- Tutorial passo a passo completo
- Configuração do Cloudflare Worker
- Setup do N8N
- Códigos prontos para copiar
- Troubleshooting
- FAQ

---

## 🚀 Quick Start

### Pré-requisitos

- Conta Cloudflare (gratuita)
- Domínio próprio na Cloudflare
- Instância N8N
- Banco de dados (qualquer um)

### Instalação Rápida

1. **Cloudflare Worker**
   - Crie um Worker
   - Cole o código (veja documentação)
   - Configure as variáveis

2. **DNS**
   - Crie um subdomínio (ex: `e.seudominio.com`)
   - Tipo AAAA → `100::` → Proxied

3. **Workers Route**
   - Route: `e.seudominio.com/*`
   - Worker: Selecione o worker criado

4. **N8N**
   - Importe o workflow
   - Configure o banco de dados
   - Ative o workflow

5. **Teste**
   - Crie um link curto
   - Acesse e veja o redirect funcionando!

---

## 🏗️ Arquitetura

```
Usuário acessa link curto
       ↓
Cloudflare Worker intercepta
       ↓
N8N busca no banco de dados
       ↓
N8N incrementa contador
       ↓
N8N retorna redirect 302
       ↓
Worker redireciona usuário
```

---

## 💾 Estrutura do Banco de Dados

```sql
CREATE TABLE links_curtos (
  codigo VARCHAR(20) PRIMARY KEY,
  url_original TEXT NOT NULL,
  url_encurtada VARCHAR(255),
  criado_em TIMESTAMP,
  acessos INTEGER DEFAULT 0
);
```

---

## ⚙️ Configuração

### Worker (config no início do código)

```javascript
const CONFIG = {
  webhookN8N: 'https://webhook.seudominio.com/webhook/encurtador',
  nomeServico: 'Seu Servico',
  corPrimaria: '#6366F1',
  habilitarCache: false,
  // ... mais opções
};
```

### N8N Workflow

**Workflow 1 - Criar Links (Manual/API)**
- Recebe URL longa
- Gera código único
- Salva no banco

**Workflow 2 - Redirecionador (Produção)**
- Recebe código via webhook
- Busca URL no banco
- Incrementa contador
- Retorna redirect 302

---

## 📊 Exemplo de Uso

```bash
# Criar link curto (Workflow 1 - manual)
URL Original: https://exemplo.com/pagina-muito-longa
URL Base: https://e.seudominio.com

Resultado: https://e.seudominio.com/abc123

# Acessar link
curl -I https://e.seudominio.com/abc123

HTTP/1.1 302 Found
Location: https://exemplo.com/pagina-muito-longa
```

---

## 🔧 Personalização

### Cores

Altere as cores no Worker:
- `corPrimaria`: Cor principal
- `corSecundaria`: Cor de gradiente
- `corErro`: Cor das páginas de erro

### Mensagens

Personalize as mensagens:
- `mensagem404`: Texto quando link não existe
- `mensagemErroGenerico`: Texto de erro geral

### Performance

```javascript
habilitarCache: true,
tempoCacheSegundos: 300  // 5 minutos
```

---

## 🐛 Troubleshooting

### Worker não responde
- Verifique Workers Route
- Confirme DNS em modo Proxied (laranja)
- Aguarde propagação (1-5 min)

### Sempre retorna 404
- Verifique se código existe no banco
- Confirme que Workflow 2 está ativo
- Teste webhook diretamente

### Não redireciona
- Response Code = 302
- Header Location correto
- Respond to Webhook = "No Data"

---

## 📝 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

Você é livre para:
- ✅ Usar comercialmente
- ✅ Modificar
- ✅ Distribuir
- ✅ Uso privado

Desde que mantenha os créditos originais.

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 💡 Roadmap

Ideias para expansão:
- [ ] Dashboard de analytics
- [ ] API REST para criar links
- [ ] Expiração automática de links
- [ ] Geração de QR Codes
- [ ] Proteção por senha
- [ ] Link tracking avançado (país, dispositivo, etc)

---

## 📧 Suporte

- **Documentação:** [Link para docs](https://seusite.com/encurtador-links-docs.html)
- **Issues:** [GitHub Issues](https://github.com/usuario/repo/issues)
- **Website:** [uaiautomacao.com](https://uaiautomacao.com)

---

## ❤️ Créditos

Desenvolvido com ❤️ por **[U.ai Automação](https://uaiautomacao.com)**

### Tecnologias Utilizadas

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [N8N](https://n8n.io/)
- JavaScript

---

## ⭐ Star History

Se este projeto te ajudou, considere dar uma ⭐!

---

**© 2025 U.ai Automação - Licença MIT**
