const btnTop = document.getElementById('btnTop'), btnBottom = document.getElementById('btnBottom');
const logTop = document.getElementById('logTop'), logBottom = document.getElementById('logBottom');
const langTop = document.getElementById('langTop'), langBottom = document.getElementById('langBottom');
const moteurGeo = document.getElementById('moteurGeo');

const colCadre = document.getElementById('colCadre'), colBtnInact = document.getElementById('colBtnInact'), colAct = document.getElementById('colAct');
const bgColA = document.getElementById('bgColA'), bgColB = document.getElementById('bgColB');

// Initialisation par défaut
langTop.value = 'fr-FR';
langBottom.value = 'pt-BR';

const labels = {
    'fr-FR': "Appuyer pour parler", 'pt-BR': "Pressione para falar", 'pt-PT': "Prima para falar",
    'es-ES': "Presione para hablar", 'de-DE': "Zum Sprechen drücken", 'it-IT': "Premi per parlare",
    'ht-HT': "Peze pou pale", 'gcr-GF': "Pézé pou palé"
};

function updateBtnText(id, val) { document.getElementById(id).innerText = labels[val] || "Speak"; }
function setNom(id) { const nom = prompt("Pseudo :"); if (nom) document.getElementById(id).innerText = nom; }
function exporterPDF() { window.print(); }

colCadre.addEventListener('input', (e) => {
    document.body.style.borderColor = e.target.value;
    document.getElementById('divider').style.backgroundColor = e.target.value;
    document.getElementById('zoneTop').style.borderColor = e.target.value;
    document.getElementById('zoneBottom').style.borderColor = e.target.value;
});
bgColA.addEventListener('input', (e) => document.getElementById('zoneTop').style.backgroundColor = e.target.value);
bgColB.addEventListener('input', (e) => document.getElementById('zoneBottom').style.backgroundColor = e.target.value);
colBtnInact.addEventListener('input', (e) => { btnTop.style.backgroundColor = e.target.value; btnBottom.style.backgroundColor = e.target.value; });

function logConversation(sourceText, tradText) {
    [logTop, logBottom].forEach(log => {
        const div = document.createElement('div'); div.className = 'text-line';
        div.innerText = `${sourceText} ➔ ${tradText}`; log.appendChild(div);
    });
}

async function lancerTraduction(cote) {
    const btn = document.getElementById(cote === 'top' ? 'btnTop' : 'btnBottom');
    const source = (cote === 'top') ? langTop.value : langBottom.value;
    const cible = (cote === 'top') ? langBottom.value : langTop.value;
    
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = source;
    rec.onstart = () => { btn.style.backgroundColor = colAct.value; btn.innerText = "..."; };
    rec.onend = () => { btn.style.backgroundColor = colBtnInact.value; updateBtnText(btn.id, source); };
    rec.start();
    rec.onresult = async (e) => {
        const texte = e.results[0][0].transcript;
        const res = await fetch('/api/traductions', { 
            method: 'POST', 
            body: JSON.stringify({ 
                texte: texte, 
                source: source.split('-')[0], 
                cible: cible.split('-')[0], 
                moteur: moteurGeo.value 
            }), 
            headers: {'Content-Type':'application/json'} 
        });
        const data = await res.json();
        logConversation(texte, data.traduction);
        
        const synth = new SpeechSynthesisUtterance(data.traduction); 
        synth.lang = cible; 
        window.speechSynthesis.speak(synth);
    };
}

// Initialisation visuelle
updateBtnText('btnTop', langTop.value);
updateBtnText('btnBottom', langBottom.value);