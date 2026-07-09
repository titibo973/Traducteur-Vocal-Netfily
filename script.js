const textTop = document.getElementById('text-top'), textBottom = document.getElementById('text-bottom');
const bgCol = document.getElementById('bgCol'), colInact = document.getElementById('colInact'), colAct = document.getElementById('colAct');

function setNom(id) {
    const nom = prompt("Entrez votre nom/initiale :");
    if (nom) document.getElementById(id).innerText = nom.charAt(0).toUpperCase();
}

bgCol.addEventListener('input', (e) => {
    document.getElementById('zoneTop').style.backgroundColor = e.target.value;
    document.getElementById('zoneBottom').style.backgroundColor = e.target.value;
});

function updateBtn(btn, active) {
    btn.style.backgroundColor = active ? colAct.value : colInact.value;
}

async function lancerTraduction(cote) {
    const btn = document.getElementById(cote === 'top' ? 'btnTop' : 'btnBottom');
    const source = document.getElementById(cote === 'top' ? 'langTop' : 'langBottom').value;
    const cible = (cote === 'top') ? document.getElementById('langBottom').value : document.getElementById('langTop').value;
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    
    rec.lang = source;
    rec.onstart = () => { btn.classList.add('active'); updateBtn(btn, true); };
    rec.onend = () => { btn.classList.remove('active'); updateBtn(btn, false); };
    rec.start();

    rec.onresult = async (e) => {
        const texte = e.results[0][0].transcript;
        const res = await fetch('/api/traductions', { 
            method: 'POST', 
            body: JSON.stringify({ 
                texte: texte, 
                source: source.split('-')[0], 
                cible: cible.split('-')[0], 
                moteur: 'GLOBAL' 
            }), 
            headers: {'Content-Type':'application/json'}
        });
        const data = await res.json();
        
        if (cote === 'top') { textTop.innerText = texte; textBottom.innerText = data.traduction; }
        else { textBottom.innerText = texte; textTop.innerText = data.traduction; }

        // Réactivation de la synthèse vocale
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.traduction);
        utterance.lang = cible;
        window.speechSynthesis.speak(utterance);
    };
}