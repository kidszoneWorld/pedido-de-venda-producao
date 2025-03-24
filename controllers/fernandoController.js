const { getSpreadsheetData } = require('../utils/apiLogisticaFernando');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

// Função para converter data no formato Excel para JavaScript Date
function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) {
        return null;
    }
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
}

// Função para buscar o XML pelo número da nota (NF)
async function getXMLByNF(nf) {
    try {
        const driveId = 'b!XH-eb-xz-E6X2UiiEteqUdmnlFRU0p5LmLmtxXKjZ0IQdp2f5MVEQqMjT7VUFk1Z';
        const itemId = '01DKYK72AHRQPTUYSMCRGJB4PLCCLSM7YO';
        const sheetName = 'ENTREGAS';

        const data = await getSpreadsheetData(driveId, itemId, sheetName);
        console.log('Dados brutos do OneDrive:', data);

        const nfString = nf.toString().trim();
        console.log('Procurando NF:', nfString);

        const order = data.slice(4).find(row => {
            const rowNF = row[0] ? row[0].toString().trim() : '';
            console.log('Comparando com NF da linha:', rowNF);
            return rowNF === nfString;
        });

        if (!order) {
            console.log('Nota não encontrada:', nfString);
            return null;
        }

        const xml = order[18];
        console.log('XML encontrado:', xml ? 'Sim' : 'Não');
        return xml || null;
    } catch (error) {
        console.error('Erro ao buscar XML no OneDrive:', error);
        throw error;
    }
}

// Função auxiliar para parsear o XML em um objeto
async function parseXML(xmlString) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlString, { explicitArray: false }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Função para formatar datas
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// Função para formatar a hora
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { timeZone: 'UTC' });
}

// Função para formatar valores monetários
function formatCurrency(value) {
    if (!value) return '0,00';
    return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para formatar a chave de acesso com espaços a cada 4 dígitos
function formatChNFe(chNFe) {
    if (!chNFe) return '';
    return chNFe.match(/.{1,4}/g).join(' ');
}

// Template HTML/CSS ajustado para o DANFE completo
function generateDanfeHTML(nfeData) {
    const infNFe = nfeData?.infNFe || {};
    const emit = infNFe?.emit || {};
    const dest = infNFe?.dest || {};
    const ide = infNFe?.ide || {};
    const det = Array.isArray(infNFe?.det) ? infNFe.det : [infNFe?.det].filter(Boolean);
    const total = infNFe?.total?.ICMSTot || {};
    const transp = infNFe?.transp || {};
    const cobr = infNFe?.cobr || {};
    const fat = cobr?.fat || {};
    const dup = Array.isArray(cobr?.dup) ? cobr.dup : [cobr?.dup].filter(Boolean);
    const infAdic = infNFe?.infAdic || {};
    const chNFe = infNFe?.['$']?.Id?.replace('NFe', '') || ''; // Extrai a chave de acesso do atributo Id

    // Formatar a chave de acesso
    const formattedChNFe = formatChNFe(chNFe);

    // Endereço do emitente
    const emitAddress = `${emit?.enderEmit?.xLgr || ''}, ${emit?.enderEmit?.nro || ''}${emit?.enderEmit?.xCpl ? ' - ' + emit?.enderEmit?.xCpl : ''} - ${emit?.enderEmit?.xBairro || ''}, ${emit?.enderEmit?.xMun || ''}, ${emit?.enderEmit?.UF || ''} - CEP: ${emit?.enderEmit?.CEP || ''} - Fone ${emit?.enderEmit?.fone || ''}`;

    // Endereço do destinatário
    const destAddress = `${dest?.enderDest?.xLgr || ''}, ${dest?.enderDest?.nro || ''}${dest?.enderDest?.xCpl ? ' - ' + dest?.enderDest?.xCpl : ''} - ${dest?.enderDest?.xBairro || ''}, ${dest?.enderDest?.xMun || ''}, ${dest?.enderDest?.UF || ''} - CEP: ${dest?.enderDest?.CEP || ''}`;

    // Endereço do transportador
    const transpAddress = `${transp?.transporta?.xEnder || ''}, ${transp?.transporta?.xMun || ''}, ${transp?.transporta?.UF || ''}`;

    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>DANFE</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    margin: 0;
                    padding: 5mm;
                }
                .danfe-container {
                    width: 210mm;
                    min-height: 297mm;
                    border: 1px solid #000;
                    padding: 3mm;
                    box-sizing: border-box;
                }
                .header-recebemos {
                    text-align: center;
                    font-size: 8pt;
                    border-bottom: 1px solid #000;
                    padding-bottom: 2mm;
                    margin-bottom: 2mm;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #000;
                    padding-bottom: 2mm;
                    margin-bottom: 2mm;
                }
                .header-left {
                    width: 60mm;
                }
                .header-center {
                    text-align: center;
                    flex: 1;
                    font-size: 12pt;
                }
                .header-right {
                    text-align: right;
                    width: 70mm;
                    font-size: 9pt;
                }
                .logo-container {
                    width: 100%;
                    height: 20mm;
                    border: 1px solid #000;
                    text-align: center;
                    line-height: 20mm;
                }
                .logo-container img {
                    max-width: 100%;
                    max-height: 100%;
                    vertical-align: middle;
                }
                .barcode {
                    height: 30px;
                    margin: 2mm 0;
                }
                .section {
                    border: 1px solid #000;
                    padding: 2mm;
                    margin-bottom: 2mm;
                }
                .divider {
                    border-bottom: 1px solid #000;
                    margin: 2mm 0;
                }
                .section-title {
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    margin-bottom: 2mm;
                    text-transform: uppercase;
                    font-size: 10pt;
                }
                .row {
                    display: flex;
                    flex-wrap: wrap;
                    margin-bottom: 1mm;
                }
                .col {
                    flex: 1;
                    padding: 1mm;
                    min-width: 150px;
                }
                .col-label {
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2mm;
                    font-size: 9pt;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 1mm;
                    text-align: center;
                }
                th {
                    font-weight: bold;
                    text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="danfe-container">
                <!-- Cabeçalho "Recebemos de..." -->
                <div class="header-recebemos">
                    RECEBEMOS DE ${emit?.xNome || ''} OS PRODUTOS/SERVIÇOS CONSTANTES NA NOTA FISCAL INDICADA AO LADO<br>
                    DATA DO RECEBIMENTO: ____________________  IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR: ____________________
                </div>

                <!-- Cabeçalho Principal -->
                <div class="header">
                    <div class="header-left">
                        <div class="logo-container">
                            <img src="https://cdn.awsli.com.br/400x300/1624/1624738/logo/26bd476ece.png" alt="Logo">
                        </div>
                        <strong>${emit?.xNome || ''}</strong><br>
                        ${emitAddress}<br>
                    </div>
                    <div class="header-center">
                        <strong>DANFE</strong><br>
                        Documento Auxiliar da Nota Fiscal Eletrônica<br>
                        ${ide?.tpNF === '0' ? '0 - Entrada' : '1 - Saída'}<br>
                        Nº ${ide?.nNF || ''}<br>
                        SÉRIE: ${ide?.serie || ''}<br>
                    </div>
                    <div class="header-right">
                        <div class="barcode">
                            <svg id="barcode"></svg>
                        </div>
                        <strong>CHAVE DE ACESSO</strong><br>
                        ${formattedChNFe}<br>
                        Consulte pela chave de acesso em www.nfe.fazenda.gov.br/portal ou no site da Sefaz<br>
                        Autorizada<br>
                        <strong>PROTOCOLO DE AUTORIZAÇÃO DE USO</strong><br>
                        <!-- Deixando em branco conforme solicitado -->
                    </div>
                </div>

                <!-- Emitente -->
                <div class="section">
                    <div class="row">
                        <div class="col">
                            <span class="col-label">CNPJ:</span> ${emit?.CNPJ || ''}<br>
                            <span class="col-label">IE:</span> ${emit?.IE || ''}
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Natureza da Operação e Datas -->
                <div class="section">
                    <div class="row">
                        <div class="col">
                            <span class="col-label">NATUREZA DA OPERAÇÃO:</span> ${ide?.natOp || ''}<br>
                            <span class="col-label">INSCRIÇÃO ESTADUAL:</span> ${emit?.IE || ''}
                        </div>
                        <div class="col">
                            <span class="col-label">DATA DE EMISSÃO:</span> ${formatDate(ide?.dhEmi || '')}<br>
                            <span class="col-label">DATA DE ENTRADA/SAÍDA:</span> ${formatDate(ide?.dhSaiEnt || '')}<br>
                            <span class="col-label">HORA DA SAÍDA:</span> ${formatTime(ide?.dhSaiEnt || '')}
                        </div>
                    </div>
                </div>

                <!-- Destinatário -->
                <div class="section">
                    <div class="section-title">Destinatário/Remetente</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">NOME/RAZÃO SOCIAL:</span> ${dest?.xNome || ''}<br>
                            <span class="col-label">CNPJ:</span> ${dest?.CNPJ || ''}<br>
                            <span class="col-label">IE:</span> ${dest?.IE || ''}<br>
                        </div>
                        <div class="col">
                            <span class="col-label">ENDEREÇO:</span> ${destAddress}<br>
                            <span class="col-label">BAIRRO/DISTRITO:</span> ${dest?.enderDest?.xBairro || ''}<br>
                            <span class="col-label">MUNICÍPIO:</span> ${dest?.enderDest?.xMun || ''}<br>
                            <span class="col-label">UF:</span> ${dest?.enderDest?.UF || ''}<br>
                            <span class="col-label">CEP:</span> ${dest?.enderDest?.CEP || ''}
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Local de Entrega -->
                <div class="section">
                    <div class="section-title">Local de Entrega</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">CNPJ:</span> ${infNFe?.entrega?.CNPJ || ''}<br>
                            <span class="col-label">ENDEREÇO:</span> ${infNFe?.entrega?.xLgr || ''}, ${infNFe?.entrega?.nro || ''}${infNFe?.entrega?.xCpl ? ' - ' + infNFe?.entrega?.xCpl : ''}<br>
                            <span class="col-label">BAIRRO/DISTRITO:</span> ${infNFe?.entrega?.xBairro || ''}<br>
                            <span class="col-label">MUNICÍPIO:</span> ${infNFe?.entrega?.xMun || ''}<br>
                            <span class="col-label">UF:</span> ${infNFe?.entrega?.UF || ''}
                        </div>
                    </div>
                </div>

                <!-- Faturas/Duplicatas -->
                <div class="section">
                    <div class="section-title">Faturas / Duplicatas</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">Nº / V. Orig.:</span> ${fat?.nFat || ''} / ${formatCurrency(fat?.vOrig)}<br>
                            <span class="col-label">Nº / Vencimento / Valor Nº:</span><br>
                            ${dup.map(d => `${d?.nDup || ''} / ${formatDate(d?.dVenc || '')} / ${formatCurrency(d?.vDup)}`).join('<br>')}
                        </div>
                    </div>
                </div>

                <!-- Cálculo do Imposto -->
                <div class="section">
                    <div class="section-title">Cálculo do Imposto</div>
                    <table>
                        <tr>
                            <td><span class="col-label">BASE DE CÁLCULO DO ICMS:</span> ${formatCurrency(total?.vBC)}</td>
                            <td><span class="col-label">VALOR DO ICMS:</span> ${formatCurrency(total?.vICMS)}</td>
                            <td><span class="col-label">BASE DE CÁLC. DO ICMS ST:</span> ${formatCurrency(total?.vBCST)}</td>
                            <td><span class="col-label">VALOR DO ICMS ST:</span> ${formatCurrency(total?.vST)}</td>
                            <td><span class="col-label">VALOR APROX. TRIBUTOS:</span> ${formatCurrency(total?.vTotTrib)}</td>
                            <td><span class="col-label">VALOR TOTAL DOS PRODUTOS:</span> ${formatCurrency(total?.vProd)}</td>
                        </tr>
                        <tr>
                            <td><span class="col-label">VALOR DO FRETE:</span> ${formatCurrency(total?.vFrete)}</td>
                            <td><span class="col-label">VALOR DO SEGURO:</span> ${formatCurrency(total?.vSeg)}</td>
                            <td><span class="col-label">DESCONTO:</span> ${formatCurrency(total?.vDesc)}</td>
                            <td><span class="col-label">OUTRAS DESP. ACESSÓRIAS:</span> ${formatCurrency(total?.vOutro)}</td>
                            <td><span class="col-label">VALOR DO IPI:</span> ${formatCurrency(total?.vIPI)}</td>
                            <td><span class="col-label">VALOR TOTAL DA NOTA:</span> ${formatCurrency(total?.vNF)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Transportador -->
                <div class="section">
                    <div class="section-title">Transportador/Volumes Transportados</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">RAZÃO SOCIAL:</span> ${transp?.transporta?.xNome || ''}<br>
                            <span class="col-label">FRETE POR CONTA:</span> ${transp?.modFrete === '0' ? '0 - EMITENTE' : '1 - DESTINATÁRIO'}<br>
                            <span class="col-label">CÓDIGO ANTT:</span> ${transp?.veicTransp?.RNTC || ''}<br>
                            <span class="col-label">PLACA VEÍCULO:</span> ${transp?.veicTransp?.placa || ''}<br>
                            <span class="col-label">UF:</span> ${transp?.transporta?.UF || ''}<br>
                            <span class="col-label">QUANTIDADE:</span> ${transp?.vol?.qVol || ''}<br>
                            <span class="col-label">ESPÉCIE:</span> ${transp?.vol?.esp || ''}<br>
                            <span class="col-label">MARCA:</span> ${transp?.vol?.marca || ''}<br>
                            <span class="col-label">NÚMERO:</span> ${transp?.vol?.nVol || ''}<br>
                            <span class="col-label">PESO BRUTO:</span> ${transp?.vol?.pesoB || ''}<br>
                            <span class="col-label">PESO LÍQUIDO:</span> ${transp?.vol?.pesoL || ''}
                        </div>
                        <div class="col">
                            <span class="col-label">CNPJ:</span> ${transp?.transporta?.CNPJ || ''}<br>
                            <span class="col-label">ENDEREÇO:</span> ${transpAddress}<br>
                            <span class="col-label">MUNICÍPIO:</span> ${transp?.transporta?.xMun || ''}<br>
                            <span class="col-label">UF:</span> ${transp?.transporta?.UF || ''}<br>
                            <span class="col-label">IE:</span> ${transp?.transporta?.IE || ''}
                        </div>
                    </div>
                </div>

                <!-- Produtos -->
                <div class="section">
                    <div class="section-title">Dados do Produto/Serviço</div>
                    <table>
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>DESCRIÇÃO DO PRODUTO/SERVIÇO</th>
                                <th>NCM/SH</th>
                                <th>CFOP</th>
                                <th>UN</th>
                                <th>QUANT.</th>
                                <th>VLR. UNIT.</th>
                                <th>VLR. TOTAL</th>
                                <th>BC ICMS</th>
                                <th>VLR. ICMS</th>
                                <th>VLR. IPI</th>
                                <th>ALIQ. ICMS</th>
                                <th>ALIQ. IPI</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${det.map(item => `
                                <tr>
                                    <td>${item?.prod?.cProd || ''}</td>
                                    <td>${item?.prod?.xProd || ''}${item?.infAdProd ? '<br>' + item.infAdProd : ''}</td>
                                    <td>${item?.prod?.NCM || ''}</td>
                                    <td>${item?.prod?.CFOP || ''}</td>
                                    <td>${item?.prod?.uCom || ''}</td>
                                    <td>${item?.prod?.qCom || ''}</td>
                                    <td>${formatCurrency(item?.prod?.vUnCom)}</td>
                                    <td>${formatCurrency(item?.prod?.vProd)}</td>
                                    <td>${formatCurrency(item?.imposto?.ICMS?.ICMS00?.vBC)}</td>
                                    <td>${formatCurrency(item?.imposto?.ICMS?.ICMS00?.vICMS)}</td>
                                    <td>${formatCurrency(item?.imposto?.IPI?.IPITrib?.vIPI)}</td>
                                    <td>${item?.imposto?.ICMS?.ICMS00?.pICMS || '0,00'}</td>
                                    <td>${item?.imposto?.IPI?.IPITrib?.pIPI || '0,00'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Cálculo do ISSQN -->
                <div class="section">
                    <div class="section-title">Cálculo do ISSQN</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">INSCRIÇÃO MUNICIPAL:</span> ${emit?.IM || ''}<br>
                            <span class="col-label">VALOR TOTAL DOS SERVIÇOS:</span> ${formatCurrency(total?.vServ)}<br>
                            <span class="col-label">BASE DE CÁLCULO DO ISSQN:</span> ${formatCurrency(total?.vBCISS)}<br>
                            <span class="col-label">VALOR DO ISSQN:</span> ${formatCurrency(total?.vISS)}
                        </div>
                    </div>
                </div>

                <!-- Dados Adicionais -->
                <div class="section">
                    <div class="section-title">Dados Adicionais</div>
                    <div class="row">
                        <div class="col">
                            <span class="col-label">INFORMAÇÕES COMPLEMENTARES:</span> ${infAdic?.infCpl || ''}<br>
                            <span class="col-label">RESERVADO AO FISCO:</span> ${infAdic?.infAdFisco || ''}
                        </div>
                    </div>
                </div>
            </div>
            <script>
                // Gera o código de barras para a chave de acesso
                JsBarcode("#barcode", "${chNFe}", {
                    format: "CODE128",
                    displayValue: false,
                    width: 1,
                    height: 30,
                    margin: 0
                });
            </script>
        </body>
        </html>
    `;
}

async function downloadDANFE(req, res) {
    try {
        const nf = req.query.nf;
        if (!nf) {
            console.log('Erro: Nenhum número de nota fornecido.');
            return res.status(400).send('Nenhum número de nota fornecido.');
        }

        console.log('Buscando XML para NF:', nf);
        const xml = await getXMLByNF(nf);
        if (!xml) {
            console.log('Erro: XML não encontrado para NF:', nf);
            return res.status(404).send('XML não encontrado para esta nota.');
        }

        console.log('XML obtido com sucesso:', xml.substring(0, 100) + '...');

        if (typeof xml !== 'string' || !xml.startsWith('<?xml')) {
            console.error('Erro: XML inválido ou malformado para NF:', nf);
            return res.status(400).send('XML inválido ou malformado.');
        }

        console.log('Inicializando a geração da DANFE para NF:', nf);

        // Parseia o XML para um objeto
        const xmlObject = await parseXML(xml);
        const nfeData = xmlObject.nfeProc || xmlObject.NFe; // Ajusta conforme a estrutura do XML
        if (!nfeData) {
            throw new Error('Estrutura do XML inválida: NFe não encontrada.');
        }

        // Gera o HTML do DANFE
        const html = generateDanfeHTML(nfeData);
        console.log('HTML gerado com sucesso.');

        // Gera o PDF com puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            timeout: 60000
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true, 
            landscape: false // Define a orientação como retrato
        });
        await browser.close();
        console.log('PDF gerado com sucesso para NF:', nf);

        res.setHeader('Content-Disposition', `attachment; filename=danfe_${nf}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erro ao gerar a DANFE para NF:', req.query.nf, error);
        res.status(500).send(`Erro ao gerar a DANFE: ${error.message}`);
    }
}

async function fetchLogisticsData(req, res) {
    try {
        const driveId = 'b!XH-eb-xz-E6X2UiiEteqUdmnlFRU0p5LmLmtxXKjZ0IQdp2f5MVEQqMjT7VUFk1Z';
        const itemId = '01DKYK72AHRQPTUYSMCRGJB4PLCCLSM7YO';
        const sheetName = 'ENTREGAS';

        const data = await getSpreadsheetData(driveId, itemId, sheetName);
        const userNumero = req.session?.userNumero || null;
        console.log('Número do Representante na Sessão:', userNumero);

        let formattedData = data.slice(4).map(row => ({
            NF: row[0],
            EMISSÃO: row[1] ? (excelDateToJSDate(row[1]) ? excelDateToJSDate(row[1]).toISOString() : null) : null,
            codCliente: row[2],
            Rep: row[4],
            NOME: row[5],
            UF: row[8],
            REGIÃO: row[7],
            VOL: row[9],
            CodTransporte: row[10],
            TRANSPORTES: row[11],
            SAÍDA: row[12] ? (excelDateToJSDate(row[12]) ? excelDateToJSDate(row[12]).toISOString() : null) : null,
            PrevisaoEntrega: row[13] ? (excelDateToJSDate(row[13]) ? excelDateToJSDate(row[13]).toISOString() : null) : null,
            ENTREGUE: row[14] ? (excelDateToJSDate(row[14]) ? excelDateToJSDate(row[14]).toISOString() : null) : null,
            AGENDA: row[16],
            OCORRÊNCIA: row[17],
            CNPJ: row[3],
            STATUS_ENTREGA: row[15],
            XML: row[18]
        }));

        if (userNumero) {
            formattedData = formattedData.filter(order => order.Rep.toString() === userNumero.toString());
        }

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar dados do OneDrive:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do OneDrive' });
    }
}

async function fetchLogisticsData1(req, res) {
    try {
        const driveId = 'b!XH-eb-xz-E6X2UiiEteqUdmnlFRU0p5LmLmtxXKjZ0IQdp2f5MVEQqMjT7VUFk1Z';
        const itemId = '01DKYK72ENRPET44VS6NC2NCRAFFSQL2WJ';
        const sheetName = 'ENTREGAS';

        const data = await getSpreadsheetData(driveId, itemId, sheetName);
        const userNumero = req.session?.userNumero || null;
        console.log('Número do Representante na Sessão:', userNumero);

        let formattedData = data.slice(4).map(row => ({
            NF: row[0],
            EMISSÃO: row[1] ? (excelDateToJSDate(row[1]) ? excelDateToJSDate(row[1]).toISOString() : null) : null,
            codCliente: row[2],
            Rep: row[4],
            NOME: row[5],
            UF: row[8],
            REGIÃO: row[7],
            VOL: row[9],
            CodTransporte: row[10],
            TRANSPORTES: row[11],
            SAÍDA: row[12] ? (excelDateToJSDate(row[12]) ? excelDateToJSDate(row[12]).toISOString() : null) : null,
            PrevisaoEntrega: row[13] ? (excelDateToJSDate(row[13]) ? excelDateToJSDate(row[13]).toISOString() : null) : null,
            ENTREGUE: row[14] ? (excelDateToJSDate(row[14]) ? excelDateToJSDate(row[14]).toISOString() : null) : null,
            AGENDA: row[16],
            OCORRÊNCIA: row[17],
            CNPJ: row[3],
            STATUS_ENTREGA: row[15]
        }));

        if (userNumero) {
            formattedData = formattedData.filter(order => order.Rep.toString() === userNumero.toString());
        }

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar dados do OneDrive:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do OneDrive' });
    }
}

// Rota para baixar o XML
async function downloadXML(req, res) {
    try {
        const nf = req.query.nf;
        if (!nf) {
            return res.status(400).send('Nenhum número de nota fornecido.');
        }

        const xml = await getXMLByNF(nf);
        if (!xml) {
            return res.status(404).send('XML não encontrado para esta nota.');
        }

        res.setHeader('Content-Disposition', `attachment; filename=nota_${nf}.xml`);
        res.setHeader('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Erro ao baixar o XML:', error);
        res.status(500).send('Erro ao baixar o XML.');
    }
}

// Rota para exibir o XML
async function viewXML(req, res) {
    try {
        const xml = req.query.xml;
        if (!xml) {
            return res.status(400).send('Nenhum XML fornecido.');
        }

        const decodedXML = decodeURIComponent(xml);
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Visualizar XML</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        background-color: #f4f4f4;
                    }
                    h1 {
                        color: #333;
                    }
                    pre {
                        background-color: #fff;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                    .back-button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #fff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    .back-button:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <h1>Visualizar XML da Nota</h1>
                <pre>${decodedXML}</pre>
                <button class="back-button" onclick="window.close()">Fechar</button>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro ao exibir o XML:', error);
        res.status(500).send('Erro ao exibir o XML.');
    }
}

module.exports = {
    fetchLogisticsData,
    fetchLogisticsData1,
    viewXML,
    downloadXML,
    downloadDANFE
};