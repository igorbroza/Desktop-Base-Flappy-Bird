// Configurações do jogo
let tabuleiro; // Referência ao elemento do tabuleiro no HTML
let larguraTabuleiro = 360; // Largura do tabuleiro em pixels
let alturaTabuleiro = 640; // Altura do tabuleiro em pixels
let contexto; // Contexto de renderização 2D do tabuleiro

// Configurações do pássaro
let larguraPassaro = 34; // Largura do pássaro em pixels
let alturaPassaro = 24; // Altura do pássaro em pixels
let posicaoXPassaro = 45; // Posição inicial do pássaro no eixo X
let posicaoYPassaro = 320; // Posição inicial do pássaro no eixo Y
let imagemPassaro; // Imagem do pássaro a ser carregada

// Objeto representando o pássaro
let passaro = {
    x: posicaoXPassaro, // Posição atual do pássaro no eixo X
    y: posicaoYPassaro, // Posição atual do pássaro no eixo Y
    largura: larguraPassaro, // Largura do pássaro
    altura: alturaPassaro // Altura do pássaro
};

// Configurações dos canos
let arrayCanos = []; // Array para armazenar os canos em cena
let larguraCano = 64; // Largura dos canos em pixels
let alturaCano = 512; // Altura dos canos em pixels
let posicaoXCano = larguraTabuleiro; // Posição inicial dos canos no eixo X
let posicaoYCano = 0; // Posição inicial dos canos no eixo Y

let imagemCanoSuperior; // Imagem do cano superior a ser carregada
let imagemCanoInferior; // Imagem do cano inferior a ser carregada

// Configurações de física
let velocidadeX = -2; // Velocidade de movimento dos canos para a esquerda
let velocidadeY = 0; // Velocidade de salto do pássaro
let gravidade = 0.4; // Gravidade aplicada ao pássaro

let jogoEncerrado = false; // Indica se o jogo está encerrado
let pontuacao = 0; // Pontuação do jogador

let valorAposta;
let aposta;
// Aguarda até que a página HTML seja totalmente carregada antes de executar o código
window.onload = function () {
    // Obtém a referência do elemento do tabuleiro no HTML usando o ID "tabuleiro"
    tabuleiro = document.getElementById("tabuleiro");

    // Define a altura e largura do tabuleiro com base nas variáveis predefinidas
    tabuleiro.height = alturaTabuleiro;
    tabuleiro.width = larguraTabuleiro;

    // Obtém o contexto de desenho 2D do tabuleiro
    contexto = tabuleiro.getContext("2d"); // Usado para desenhar no tabuleiro

    // Desenha a imagem do pássaro no tabuleiro quando ela é carregada
    imagemPassaro = new Image(); //Construtor padrão para criar objetos de imagem
    imagemPassaro.src = "assets/flappybird.png"; //Define o PNG da imagem
    imagemPassaro.onload = function () {
        contexto.drawImage(imagemPassaro, passaro.x, passaro.y, passaro.largura, passaro.altura);
    }


    // Carrega a imagem do cano superior
    imagemCanoSuperior = new Image();
    imagemCanoSuperior.src = "assets/cano-alto.png";

    // Carrega a imagem do cano inferior
    imagemCanoInferior = new Image();
    imagemCanoInferior.src = "assets/cano-baixo.png";

    const form = document.querySelector('.formulario');
    //botaoIniciar.addEventListener('click', () => {

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        valorAposta = document.querySelector('#aposta');
        aposta = valorAposta.value.trim();
        console.log("valor digitado: ", aposta);
        // Inicia o loop de atualização do jogo usando requestAnimationFrame
        requestAnimationFrame(atualizar);

        // Gera novos canos a cada 1.5 segundos usando setInterval
        if(aposta < 100){
            setInterval(gerarCanos, 1500);
        }else if(aposta < 200){
            setInterval(gerarCanos, 1200);
            velocidadeX = -3;
            velocidadeY = -4;
        }else{
            setInterval(gerarCanos, 900);
            velocidadeX = -4;
            velocidadeY = -3;
        }

        // Adiciona um ouvinte de evento para responder às teclas pressionadas
        document.addEventListener("keydown", moverPassaro);
    });
        
    //});

}

function moverPassaro(evento) {
    // Verifica se a tecla pressionada é a barra de espaço, seta para cima ou tecla X
    if (evento.code == "ArrowUp" || evento.code == "KeyX") {
        // Ajusta a velocidade vertical para simular um salto
        velocidadeY = -6;

    }
}

function atualizar() {
    // Solicita ao navegador que chame novamente a função atualizar na próxima renderização
    requestAnimationFrame(atualizar);

    if (jogoEncerrado) {
        contexto.fillText("VALOR GANHO", 5, 100);
        contexto.fillText("R$"+pontuacao.toFixed(1), 40, 150);
        return;
    }

    // Limpa a área do tabuleiro para desenhar a próxima moldura
    contexto.clearRect(0, 0, tabuleiro.width, tabuleiro.height);

    // Pássaro
    // Aumenta a velocidade vertical do pássaro aplicando a força da gravidade
    velocidadeY += gravidade;

    // Atualiza a posição vertical do pássaro com base na velocidade
    passaro.y = Math.max(passaro.y + velocidadeY, 0); // Aplica a gravidade à posição Y atual do pássaro, limitando a posição Y ao topo do canvas

    // Desenha a imagem do pássaro na nova posição
    contexto.drawImage(imagemPassaro, passaro.x, passaro.y, passaro.largura, passaro.altura);

    // Itera sobre os canos presentes no arrayCanos
    for (let i = 0; i < arrayCanos.length; i++) {
        let cano = arrayCanos[i];

        // Move o cano para a esquerda com base na velocidadeX
        cano.x += velocidadeX;

        // Desenha o cano no contexto do tabuleiro
        contexto.drawImage(cano.imagem, cano.x, cano.y, cano.largura, cano.altura);

        // Verifica se o pássaro passou pelo cano
        if (!cano.passou && passaro.x > cano.x + cano.largura) {
            pontuacao += aposta * 0.05; // Incrementa a pontuação por meio ponto
            cano.passou = true; // Marca que o pássaro já passou por esse cano
        }

        // Verifica se há colisão entre o pássaro e o cano
        if (detectarColisao(passaro, cano)) {
            jogoEncerrado = true; // Marca que o jogo está encerrado em caso de colisão
        }
    }

    // Limpa os canos que já passaram da tela
    while (arrayCanos.length > 0 && arrayCanos[0].x < -larguraCano) {
        arrayCanos.shift(); // Remove o primeiro elemento do array de canos
    }

    // Pontuação
    contexto.fillStyle = "white";
    contexto.font = "45px sans-serif";
    contexto.fillText(pontuacao, 5, 45);

}

function gerarCanos() {
    // Verifica se o jogo está encerrado antes de gerar novos canos
    if (jogoEncerrado) {
        return;
    }

    // Calcula uma posição Y aleatória para o conjunto de canos
    let posicaoYCanoAleatoria = posicaoYCano - alturaCano / 4 - Math.random() * (alturaCano / 2);
    // Define o espaço de abertura entre os canos como um quarto da altura do tabuleiro
    let espacoAbertura = tabuleiro.height / 4;

    // Cria um objeto representando o cano superior
    let canoSuperior = {
        imagem: imagemCanoSuperior, // Imagem do cano superior
        x: posicaoXCano, // Posição inicial do cano superior no eixo X
        y: posicaoYCanoAleatoria, // Posição inicial do cano superior no eixo Y
        largura: larguraCano, // Largura do cano
        altura: alturaCano, // Altura do cano
        passou: false // Indica se o pássaro já passou por esse cano
    };
    // Adiciona o cano superior ao array de canos
    arrayCanos.push(canoSuperior);

    // Cria um objeto representando o cano inferior
    let canoInferior = {
        imagem: imagemCanoInferior, // Imagem do cano inferior
        x: posicaoXCano, // Posição inicial do cano inferior no eixo X
        y: posicaoYCanoAleatoria + alturaCano + espacoAbertura, // Posição inicial do cano inferior no eixo Y
        largura: larguraCano, // Largura do cano
        altura: alturaCano, // Altura do cano
        passou: false // Indica se o pássaro já passou por esse cano
    };
    // Adiciona o cano inferior ao array de canos
    arrayCanos.push(canoInferior);
}


// Função para detectar colisão entre dois objetos retangulares (objetoA e objetoB)
function detectarColisao(passaro, cano) {
    //verifica se a sobreposição de objetos
    const colisaoX = passaro.x < cano.x + cano.largura && passaro.x + passaro.largura > cano.x;
    const colisaoY = passaro.y < cano.y + cano.altura && passaro.y + passaro.altura > cano.y;

    if (colisaoX && colisaoY) {
        console.log("Colisão detectada")
        return true;
    }

    return false;
}