// ============================================================================
// INSTRUÇÕES DE INSTALAÇÃO
// ============================================================================
// 
// 1. CRIAÇÃO DO WORKER:
//    Para criar o Worker, acesse o dashboard da Cloudflare, vá em "Workers & Pages", 
//    clique em "Create" e selecione "Start with Hello World!". Dê um nome ao Worker 
//    (ex: "encurtador"), clique em "Deploy" e depois em "Edit Code" para substituir 
//    o código padrão pelo código fornecido.
//
// 2. CONFIGURAÇÃO DE SUBDOMÍNIO:
//    IMPORTANTE: É necessário criar um subdomínio exclusivo para o encurtador de links,
//    pois o Worker redirecionará TODOS os acessos a esse subdomínio para o sistema de 
//    encurtamento. Por exemplo: e.seudominio.com
//    
//    Não use seu domínio principal ou subdomínios que já estejam em uso para outros serviços.
//
// ============================================================================
// CONFIGURACAO - EDITE APENAS ESTA SECAO
// ============================================================================

const CONFIG = {
  // URL do webhook N8N (OBRIGATORIO)
  webhookN8N: 'https://webhook.uaiautomacao.com/webhook/encurtador',
  
  // Nome da empresa/servico (aparece nas paginas)
  nomeServico: 'UAI Automacao',
  
  // Titulo da pagina inicial
  tituloPaginaInicial: 'Encurtador de Links',
  
  // Texto da pagina inicial
  descricaoPaginaInicial: 'Servico de encurtamento de links',
  
  // Cor primaria (hexadecimal)
  corPrimaria: '#667eea',
  
  // Cor secundaria (hexadecimal)
  corSecundaria: '#764ba2',
  
  // Cor de erro (hexadecimal)
  corErro: '#e74c3c',
  
  // Habilitar cache (true/false)
  habilitarCache: false,
  
  // Tempo de cache em segundos (apenas se habilitarCache = true)
  tempoCacheSegundos: 60,
  
  // Mensagem de erro 404
  mensagem404: 'O link curto que voce tentou acessar nao existe ou pode ter expirado.',
  
  // Mensagem de erro generico
  mensagemErroGenerico: 'Nao foi possivel processar este link no momento. Por favor, tente novamente em alguns instantes.',
};

// ============================================================================
// NAO EDITE ABAIXO DESTA LINHA
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    
    if (!path || path === '') {
      return handleHomePage();
    }
    
    if (path === 'health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: CONFIG.nomeServico
      }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    
    return handleRedirect(path, request);
  },
};

async function handleRedirect(code, request) {
  // ANTES: const n8nUrl = `${CONFIG.webhookN8N}/${code}`;
  
  // AGORA: Envia o código como query parameter
  const n8nUrl = `${CONFIG.webhookN8N}?code=${encodeURIComponent(code)}`;
  
  try {
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'CloudflareWorker/1.0',
        'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
        'X-Real-IP': request.headers.get('CF-Connecting-IP') || '',
        'CF-Ray': request.headers.get('CF-Ray') || '',
      },
      redirect: 'manual',
    });
    
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('Location');
      
      if (!location) {
        return handleError('Redirect location missing', 500);
      }
      
      const cacheControl = CONFIG.habilitarCache 
        ? `public, max-age=${CONFIG.tempoCacheSegundos}` 
        : 'no-cache, no-store, must-revalidate';
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': location,
          'Cache-Control': cacheControl,
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
    
    if (response.status === 404) {
      return handleNotFound(code);
    }
    
    if (response.headers.get('content-type')?.includes('text/html')) {
      return response;
    }
    
    return handleError(`Unexpected response: ${response.status}`, response.status);
    
  } catch (error) {
    console.error('Redirect error:', error);
    return handleError(error.message, 500);
  }
}

function handleHomePage() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.nomeServico} - ${CONFIG.tituloPaginaInicial}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, ${CONFIG.corPrimaria} 0%, ${CONFIG.corSecundaria} 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    h1 {
      color: ${CONFIG.corPrimaria};
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    p {
      color: #666;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${CONFIG.nomeServico}</h1>
    <p>${CONFIG.descricaoPaginaInicial}</p>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}

function handleNotFound(code) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link nao encontrado - ${CONFIG.nomeServico}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, ${CONFIG.corPrimaria} 0%, ${CONFIG.corSecundaria} 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: ${CONFIG.corErro};
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .code {
      background: #f5f5f5;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin: 1.5rem 0;
      font-family: 'Courier New', monospace;
      color: #333;
      word-break: break-all;
    }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: ${CONFIG.corPrimaria};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔗</div>
    <h1>404</h1>
    <h2>Link nao encontrado</h2>
    <p>${CONFIG.mensagem404}</p>
    <div class="code">/${code}</div>
    <p>Verifique se o link foi digitado corretamente ou entre em contato com quem compartilhou o link.</p>
    <a href="/" class="btn">Voltar para a pagina inicial</a>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    status: 404,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'no-cache',
    },
  });
}

function handleError(message, status = 500) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro - ${CONFIG.nomeServico}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, ${CONFIG.corPrimaria} 0%, ${CONFIG.corSecundaria} 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: ${CONFIG.corErro};
      margin-bottom: 1rem;
      font-size: 2rem;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .error {
      background: #fee;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #c33;
      border: 1px solid #fcc;
    }
    .btn {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: ${CONFIG.corPrimaria};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.3s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Erro ao processar requisicao</h1>
    <p>${CONFIG.mensagemErroGenerico}</p>
    <div class="error">Detalhes: ${message}</div>
    <a href="/" class="btn">Voltar para a pagina inicial</a>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'no-cache',
    },
  });
}