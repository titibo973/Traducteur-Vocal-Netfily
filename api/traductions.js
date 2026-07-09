export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') return res.status(405).json({ error: "Méthode non autorisée" });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { texte, source, cible, moteur } = body;
        
        if (!texte) return res.status(400).json({ error: "Texte manquant" });

        let traduction = "";
        if (moteur === 'CHINE') {
            traduction = `[Test Chine] ${texte}`;
        } else {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=${source || 'fr'}|${cible || 'en'}`;
            const response = await fetch(url);
            const data = await response.json();
            traduction = data.responseData.translatedText;
        }
        return res.status(200).json({ traduction });
    } catch (error) {
        return res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
}