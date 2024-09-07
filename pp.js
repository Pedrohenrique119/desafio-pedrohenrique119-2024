import readline from 'readline';

// Dados dos recintos e animais
const recintos = [
    { numero: 1, bioma: 'savana', tamanho: 10, ocupacao: 3, animais: ['macaco'] },
    { numero: 2, bioma: 'floresta', tamanho: 5, ocupacao: 0, animais: [] },
    { numero: 3, bioma: 'savana e rio', tamanho: 7, ocupacao: 1, animais: ['gazela'] },
    { numero: 4, bioma: 'rio', tamanho: 8, ocupacao: 0, animais: [] },
    { numero: 5, bioma: 'savana', tamanho: 9, ocupacao: 1, animais: ['leão'] }
];

const animais = {
    leao: { tamanho: 3, biomas: ['savana'], carnivoro: true },
    leopardo: { tamanho: 2, biomas: ['savana'], carnivoro: true },
    crocodilo: { tamanho: 3, biomas: ['rio'], carnivoro: true },
    macaco: { tamanho: 1, biomas: ['savana', 'floresta'], carnivoro: false },
    gazela: { tamanho: 2, biomas: ['savana'], carnivoro: false },
    hipopotamo: { tamanho: 4, biomas: ['savana', 'rio'], carnivoro: false }
};

// Função para exibir a tabela de recintos
function exibirRecintos() {
    console.log('O zoológico possui os seguintes recintos disponíveis.');
    console.table(recintos.map(recinto => ({
        número: recinto.numero,
        bioma: recinto.bioma,
        'tamanho total': recinto.tamanho,
        'animais existentes': recinto.animais.length > 0 ? `${recinto.animais.length} ${recinto.animais.join(', ')}` : 'vazio'
    })));
}

// Função para exibir a tabela de animais
function exibirAnimais() {
    console.log('ANIMAIS');
    console.table(Object.entries(animais).map(([especie, dados]) => ({
        espécie: especie.toUpperCase(),
        tamanho: dados.tamanho,
        bioma: dados.biomas.join(' ou ')
    })));
}

// Função para verificar se um animal pode ser colocado em um recinto
function podeColocarAnimal(recinto, especie, quantidade) {
    const animal = animais[especie];

    // Verifica se a espécie é válida
    if (!animal) {
        return { erro: 'Animal inválido' };
    }

    // Verifica se a quantidade é válida
    if (quantidade <= 0 || !Number.isInteger(quantidade)) {
        return { erro: 'Quantidade inválida' };
    }

    // Regra 1: Bioma adequado e espaço suficiente
    if (!animal.biomas.includes(recinto.bioma) && recinto.bioma !== 'savana e rio') {
        return { erro: `O ${especie} não pode habitar o bioma ${recinto.bioma}.` };
    }

    let espacoNecessario = (animal.tamanho * quantidade) + (recinto.animais.length > 0 && animal.carnivoro === false ? 1 : 0);
    if (recinto.ocupacao + espacoNecessario > recinto.tamanho) {
        return { erro: `Não há espaço suficiente para ${quantidade} ${especie}(s) no recinto ${recinto.numero}.` };
    }

    // Regra 2: Carnívoros só podem habitar com a própria espécie
    if (animal.carnivoro && recinto.animais.length > 0 && recinto.animais.some(a => a !== especie)) {
        return { erro: `Animais carnívoros só podem habitar com a própria espécie no recinto ${recinto.numero}.` };
    }

    // Regra 3: Animais existentes devem continuar confortáveis
    if (recinto.animais.some(a => !verificarConforto(recinto, a))) {
        return { erro: `A inclusão de ${quantidade} ${especie}(s) deixaria os animais atuais desconfortáveis no recinto ${recinto.numero}.` };
    }

    // Regra 4: Hipopótamos só aceitam outras espécies em "savana e rio"
    if (especie === 'hipopotamo' && recinto.animais.length > 0 && recinto.bioma !== 'savana e rio') {
        return { erro: `Hipopótamos só aceitam outras espécies em recintos com savana e rio.` };
    }

    // Regra 5: Macacos precisam de outros animais
    if (especie === 'macaco' && recinto.animais.length === 0 && quantidade === 1) {
        return { erro: `Macacos não se sentem confortáveis sozinhos. Coloque mais de um animal.` };
    }

    // Se tudo estiver correto
    const espacoLivre = recinto.tamanho - (recinto.ocupacao + espacoNecessario);
    return { recinto: recinto.numero, espacoLivre, espacoTotal: recinto.tamanho };
}

// Função auxiliar para verificar se os animais existentes continuam confortáveis
function verificarConforto(recinto, especie) {
    const animal = animais[especie];
    if (especie === 'macaco' && recinto.animais.length === 1) {
        return false;
    }
    return true;
}

// Função principal para processar a entrada e gerar a saída
function processarEntrada(tipoAnimal, quantidade) {
    const resultados = [];

    recintos.forEach(recinto => {
        const resultado = podeColocarAnimal(recinto, tipoAnimal, quantidade);
        if (resultado.erro) {
            console.error(resultado.erro);
        } else {
            resultados.push({
                Recinto: resultado.recinto,
                'Espaço Livre': resultado.espacoLivre,
                'Espaço Total': resultado.espacoTotal
            });
        }
    });

    if (resultados.length === 0) {
        console.log('Não há recinto viável.');
    } else {
        console.table(resultados);
    }
}

// Configuração para leitura da entrada no terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Digite o tipo de animal e a quantidade (separados por espaço): ', (resposta) => {
    // Exibindo as tabelas
    exibirRecintos();
    exibirAnimais();

    const [tipoAnimal, quantidade] = resposta.split(' ');
    const quantidadeInt = parseInt(quantidade, 10);

    // Processando a entrada e exibindo resultados
    processarEntrada(tipoAnimal.toLowerCase(), quantidadeInt);
    rl.close();
});
