import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Carica le variabili dal file .env
dotenv.config();

if (!process.env.GITHUB_TOKEN) {
    console.error("❌ Errore: GITHUB_TOKEN non trovato nel file .env.");
    console.error("Generalo su GitHub (Personal Access Token classic) e inseriscilo nel .env");
    process.exit(1);
}

// Configurazione client GitHub Models (Inference API)
const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN
});

async function runRalphLoop() {
    console.log("🤖 [Ralph Loop] Avvio iterazione...");

    // 1. Lettura dei file di controllo (Aggiornato con system_prompt.md)
    if (!fs.existsSync('system_prompt.md') || !fs.existsSync('backlog.json') || !fs.existsSync('progress.txt')) {
        console.error("❌ Errore: Assicurati che system_prompt.md, backlog.json e progress.txt siano nella root.");
        process.exit(1);
    }

    const systemPrompt = fs.readFileSync('system_prompt.md', 'utf-8');
    const progress = fs.readFileSync('progress.txt', 'utf-8');
    const backlog = JSON.parse(fs.readFileSync('backlog.json', 'utf-8'));

    // 2. Ricerca del task corrente basata su 'implementation_order' e status 'todo'
    let currentTaskId = null;
    let currentStory = null;

    for (const taskId of backlog.implementation_order) {
        for (const epic of backlog.epics) {
            const story = epic.stories.find(s => s.id === taskId);
            if (story && story.status === 'todo') {
                currentTaskId = taskId;
                currentStory = story;
                break;
            }
        }
        if (currentTaskId) break;
    }

    if (!currentTaskId || !currentStory) {
        console.log("🎉 [Ralph Loop] Tutti i task in 'implementation_order' sono completati! Definition of Done raggiunta.");
        return;
    }

    console.log(`\n🚀 [Task Corrente]: ${currentTaskId} - ${currentStory.title}`);
    console.log(`📋 [Dettagli]:\n- ${currentStory.details.join('\n- ')}`);

    // Genera un sommario dello stato dei file attuali per dare contesto all'IA
    const getFilesStructure = (dir, fileList = []) => {
        if (!fs.existsSync(dir)) return fileList;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                    getFilesStructure(filePath, fileList);
                }
            } else {
                fileList.push(filePath);
            }
        });
        return fileList;
    };

    const currentFiles = getFilesStructure('.');
    const filesContext = currentFiles.length > 0 ? currentFiles.join('\n') : 'Nessun file creato.';

    // 3. Costruzione delle istruzioni stringenti per l'IA
    const userInstruction = `
Sei nel mezzo di un Ralph Loop. Devi implementare ESCLUSIVAMENTE il seguente task:
ID: ${currentTaskId}
Titolo: ${currentStory.title}
Dettagli di implementazione:
${currentStory.details.join('\n')}

Criteri di Accettazione da soddisfare:
${currentStory.acceptance_criteria.join('\n')}

Struttura attuale dei file nel workspace:
${filesContext}

Stato del progetto (da progress.txt):
${progress}

REGOLA TASSONOMICA DI SCRITTURA FILE (FONDAMENTALE):
Se devi creare o modificare uno o più file, DEVI produrre l'output usando ESATTAMENTE questo formato per ogni file:

<<< FILE: nome_file_con_percorso >>>
\`\`\`estensione
codice integrale del file qui
\`\`\`

Esempio:
<<< FILE: app/quest/page.tsx >>>
\`\`\`tsx
export default function Page() { ... }
\`\`\`

Non omettere parti di codice e non usare commenti del tipo "// il resto del codice rimane invariato". Scrivi sempre i file per intero.
Genera solo i file strettamente necessari a risolvere il task corrente.
`;

    try {
        console.log("🧠 Chiamata a GitHub Models in corso (modello: gpt-4o-mini)...");

        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInstruction }
            ],
            model: "gpt-4o-mini",
            temperature: 0.1
        });

        const aiResponse = response.choices[0].message.content;
        console.log("\n✨ Risposta ricevuta dall'IA. Analisi e scrittura file in corso...");

        // 4. Parser dell'output per estrarre e scrivere i file automaticamente
        const fileRegex = /<<< FILE: ([^\s>]+) >>>\n```[\w]*\n([\s\S]*?)\n```/g;
        let match;
        let filesWritten = [];

        while ((match = fileRegex.exec(aiResponse)) !== null) {
            const filePath = match[1].trim();
            const fileContent = match[2];

            // Crea le cartelle parent se non esistono
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Scrive il file su disco
            fs.writeFileSync(filePath, fileContent, 'utf-8');
            console.log(`💾 File scritto con successo: ${filePath}`);
            filesWritten.push(filePath);
        }

        if (filesWritten.length === 0) {
            console.log("⚠️ Attenzione: L'IA non ha generato blocchi file validi o non erano necessari cambi strutturali.");
        }

        // 5. Aggiornamento del backlog.json (Flipping dello stato in 'done')
        currentStory.status = "done";
        fs.writeFileSync('backlog.json', JSON.stringify(backlog, null, 2), 'utf-8');
        console.log(`\n📝 Backlog aggiornato: Task ${currentTaskId} impostato su "done".`);

        // 6. Aggiornamento del progress.txt
        const timestamp = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
        const logEntry = `
### Iterazione Ralph Loop — ${timestamp}
- **Task Eseguito**: [${currentTaskId}] ${currentStory.title}
- **Stato**: Completato automaticamente dall'agente.
- **File Modificati/Creati**:
${filesWritten.map(f => `  - ${f}`).join('\n') || '  - Nessuno'}
- **Note di esecuzione**: Verificare la compilazione con \`npm run build\` prima di procedere.
`;

        fs.writeFileSync('progress.txt', progress + logEntry, 'utf-8');
        console.log("📈 File progress.txt aggiornato con il log dell'iterazione.");
        console.log(`\n✅ Iterazione per il task ${currentTaskId} terminata con successo!`);

    } catch (error) {
        console.error("\n❌ Errore critico durante l'esecuzione del ciclo:");
        console.error(error.message);
    }
}

runRalphLoop();