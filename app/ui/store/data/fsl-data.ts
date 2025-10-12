import type { LanguageData } from "../types"

export const fslData: LanguageData = {
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      description: "Basics of Filipino Sign Language",
      progress: 25,
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Alpabeto",
          subtitle: "Matuto kung paano mag-sign ng mga titik!",
          icon: "aα\naA",
          completed: true,
          progress: 100,
          signs: [
            { id: "a", label: "A", imageUrl: "/images/fsl-labelled/a.png" },
            { id: "b", label: "B", imageUrl: "/images/fsl-labelled/b.png" },
            { id: "c", label: "C", imageUrl: "/images/fsl-labelled/c.png" },
            { id: "d", label: "D", imageUrl: "/images/fsl-labelled/d.png" },
            { id: "e", label: "E", imageUrl: "/images/fsl-labelled/e.png" },
            { id: "f", label: "F", imageUrl: "/images/fsl-labelled/f.png" },
            { id: "g", label: "G", imageUrl: "/images/fsl-labelled/g.png" },
            { id: "h", label: "H", imageUrl: "/images/fsl-labelled/h.png" },
            { id: "i", label: "I", imageUrl: "/images/fsl-labelled/i.png" },
            { id: "j", label: "J", imageUrl: "/images/fsl-labelled/j.png" },
            { id: "k", label: "K", imageUrl: "/images/fsl-labelled/k.png" },
            { id: "l", label: "L", imageUrl: "/images/fsl-labelled/l.png" },
            { id: "m", label: "M", imageUrl: "/images/fsl-labelled/m.png" },
            { id: "n", label: "N", imageUrl: "/images/fsl-labelled/n.png" },
            { id: "ng", label: "NG", imageUrl: "/images/fsl-labelled/ng.png" },
            { id: "o", label: "O", imageUrl: "/images/fsl-labelled/o.png" },
            { id: "p", label: "P", imageUrl: "/images/fsl-labelled/p.png" },
            { id: "q", label: "Q", imageUrl: "/images/fsl-labelled/q.png" },
            { id: "r", label: "R", imageUrl: "/images/fsl-labelled/r.png" },
            { id: "s", label: "S", imageUrl: "/images/fsl-labelled/s.png" },
            { id: "t", label: "T", imageUrl: "/images/fsl-labelled/t.png" },
            { id: "u", label: "U", imageUrl: "/images/fsl-labelled/u.png" },
            { id: "v", label: "V", imageUrl: "/images/fsl-labelled/v.png" },
            { id: "w", label: "W", imageUrl: "/images/fsl-labelled/w.png" },
            { id: "x", label: "X", imageUrl: "/images/fsl-labelled/x.png" },
            { id: "y", label: "Y", imageUrl: "/images/fsl-labelled/y.png" },
            { id: "z", label: "Z", imageUrl: "/images/fsl-labelled/z.png" },
            { id: "enye", label: "Ñ", imageUrl: "/images/fsl-labelled/enye.png" },
            { id: "ch", label: "CH", imageUrl: "/images/fsl-labelled/ch.png" },
          ],
          subLessons: [
            {
              id: "lesson-1-content",
              type: "content",
              title: "Learn About the FSL Alphabet",
              completed: true,
              content: `### **Lesson 1: FSL Alphabet (Fingerspelling)**

The **FSL alphabet** uses **one hand** to represent the 26 letters of the English alphabet — plus additional handshapes for **Ñ**, **NG**, and **CH**, which are unique to Filipino words and names. Each handshape stands for a letter; together they form **fingerspelling**, which you'll use for names, places, borrowed words, or terms without specific signs.

FSL, or **Filipino Sign Language**, has its historical roots in **American Sign Language (ASL)**, brought to the Philippines through Deaf education during the early 1900s. However, FSL has since evolved into its own **independent, culturally grounded language**, reflecting the Filipino Deaf community's identity, values, and daily life. It is now officially recognized as the **national sign language of the Philippines** under *Republic Act No. 11106*.

While there is **no single global sign language**, ASL became internationally well-known due to its extensive use in education, research, and media. Because of its accessibility and early introduction to Southeast Asia, many regional sign languages, including FSL, initially borrowed from ASL structures. Yet over time, FSL developed unique expressions, localized signs, and linguistic rules that make it distinctly Filipino.

| STATIC SIGN | DYNAMIC SIGN |
| ----- | ----- |
| A static sign holds its handshape, orientation, and position steady (e.g., A, B, C). | A dynamic sign involves motion — the hand moves, changes shape, or travels through space (e.g., J, Z). |

FSL signers show **natural variation** in letters — for instance, **T** and **O** may have different palm orientations compared to ASL. Some signers hold their fingers tighter or looser, depending on comfort or regional influence. These differences don't change meaning; clarity and fluency matter most.

FSL signers also tend to be **more expressive in their rhythm and movement**. When fingerspelling, keep your hand between **chest and shoulder height**, facing your conversation partner, and sign steadily — not too fast or bouncy.

> 💡 **Tip:** FSL encourages connection and clarity. Slow, smooth, and confident movements are always better than rushed, unclear ones.`
            },
            {
              id: "lesson-1-practice",
              type: "practice",
              title: "Practice Signing the Alphabet",
              completed: true,
            },
            {
              id: "lesson-1-quiz",
              type: "quiz",
              title: "Test Your Knowledge",
              completed: true,
            },
          ],
        },
        {
          id: "lesson-2",
          title: "Lesson 2: Mga Numero",
          subtitle: "Matuto kung paano mag-sign ng mga numero!",
          icon: "1️⃣2️⃣\n3️⃣4️⃣",
          completed: false,
          progress: 25,
          signs: [
            { id: "0", label: "0", imageUrl: "/images/fsl-labelled/0.png" },
            { id: "1", label: "1", imageUrl: "/images/fsl-labelled/1.png" },
            { id: "2", label: "2", imageUrl: "/images/fsl-labelled/2.png" },
            { id: "3", label: "3", imageUrl: "/images/fsl-labelled/3.png" },
            { id: "4", label: "4", imageUrl: "/images/fsl-labelled/4.png" },
            { id: "5", label: "5", imageUrl: "/images/fsl-labelled/5.png" },
            { id: "6", label: "6", imageUrl: "/images/fsl-labelled/6.png" },
            { id: "7", label: "7", imageUrl: "/images/fsl-labelled/7.png" },
            { id: "8", label: "8", imageUrl: "/images/fsl-labelled/8.png" },
            { id: "9", label: "9", imageUrl: "/images/fsl-labelled/9.png" },
            { id: "10", label: "10", imageUrl: "/images/fsl-labelled/10.png" },
          ],
          subLessons: [
            {
              id: "lesson-2-content",
              type: "content",
              title: "Learn About FSL Numbers",
              completed: false,
              content: `### **Lesson 2: FSL Numbers**

FSL numbers are **one-handed** and often similar to ASL, though with small differences in **orientation and expressivity**. Like the alphabet, numbers **1–5** resemble the first few letter shapes, so learning one helps you remember the other.

**How it works:**

* **1–5:** Palm usually faces *outward* — this contrasts with ASL, where the palm typically faces inward.

* **6–9:** The thumb touches different fingertips (6 = thumb + pinky, 7 = thumb + ring finger, and so on).

* **10:** A small flick or twist of the thumb.

* **11–19:** Quick flicks or repeated movements show the "teen" numbers.

* **20 and above:** Combine smaller numbers naturally, keeping transitions smooth.

Across the Philippines, you'll see slight **regional variations** — especially for numbers used in **money, time, or age**. These differences are a normal part of FSL's diversity and reflect how the language adapts to everyday Filipino life.

> 💡 **Tip:** FSL is practical and context-based — "3 o'clock" and "3 pesos" might be signed slightly differently. Focus on meaning, not strict uniformity.`
            },
            {
              id: "lesson-2-practice",
              type: "practice",
              title: "Practice Signing Numbers",
              completed: true,
            },
            {
              id: "lesson-2-quiz",
              type: "quiz",
              title: "Test Your Knowledge",
              completed: false,
            },
          ],
        },
        {
          id: "lesson-3",
          title: "Lesson 3: Mga Parirala",
          subtitle: "Matuto kung paano mag-sign ng mga salita!",
          icon: "❓",
          completed: false,
          progress: 0,
          signs: [],
          subLessons: [
            {
              id: "lesson-3-content",
              type: "content",
              title: "Learn About FSL Common Phrases",
              completed: false,
              content: `### **Lesson 3: FSL Common Phrases**

FSL phrases capture the **expressive, emotional, and community-oriented nature** of Filipino communication. Facial expressions, eye gaze, and body movement are not just add-ons — they are a **core part of the grammar**.

In fact, FSL places **even more emphasis on facial expressions** than ASL. The face conveys tone, mood, and intent — much like how Filipino speech uses intonation or emotion to express politeness or excitement.

Common greetings and expressions like **KUMUSTA**, **SALAMAT**, and **PAALAM** are widely recognized. They often come with natural head nods, smiles, or soft facial gestures — all part of authentic Filipino expression.

FSL also includes many **localized terms** that reflect Filipino life and culture, such as:

* **Places:** *Quiapo*, *Cebu*, *Davao*, *Baguio* — each may have unique regional variants.

* **Food:** *adobo*, *sinigang*, *halo-halo*, *pandesal* — distinct local signs often exist.

* **Expressions:** *opo*, *sige*, *ingat*, *po* — showing Filipino respect and warmth.

💡 **Non-Manual Signals (NMS):**

| Type | Use | Example |
| ----- | ----- | ----- |
| **Affective Facial Expressions (AFE)** | Show emotion or attitude | Smiling, frowning, wide eyes for surprise |
| **Grammatical Facial Expressions (GFE)** | Mark sentence type or intensity | Raised brows = yes/no question; furrowed = wh-question |

💬 Example:

* *How are you?* → **IKAW KUMUSTA?** with raised eyebrows and a friendly smile.

* *Thank you!* → **SALAMAT** with a small head bow or nod of sincerity.

Because Filipino culture values friendliness and emotion, **facial grammar** is even more pronounced in FSL. It's common for signers to use full-body storytelling, shoulder shifts, and clear eye contact to express meaning.

> 💡 **Tip:** Think of your face as your tone of voice. Don't hold back — your expressions complete your message.`
            },
            {
              id: "lesson-3-practice",
              type: "practice",
              title: "Practice Signing Phrases",
              completed: false,
            },
            {
              id: "lesson-3-quiz",
              type: "quiz",
              title: "Test Your Knowledge",
              completed: false,
            },
          ],
        },
        {
          id: "lesson-4",
          title: "Lesson 4: Gramatika",
          subtitle: "Matuto ng gramatika sa sign language!",
          icon: "📝",
          completed: false,
          progress: 0,
          signs: [],
          subLessons: [
            {
              id: "lesson-4-content",
              type: "content",
              title: "Learn About FSL Grammar",
              completed: false,
              content: `### **Lesson 4: FSL Grammar and Structure**

FSL grammar is uniquely Filipino. Like ASL, it often follows a **Topic–Comment** structure — but it also shows influences from Filipino discourse patterns (which emphasize context, emotion, and storytelling).

| English | FSL-like Gloss | Meaning |
| ----- | ----- | ----- |
| *I'm going to school today.* | **TODAY SCHOOL I GO.** | Topic = today school; Comment = I go. |
| *Where do you live?* | **IKAW LIVE WHERE?** | Topic = you live; Comment = where. |
| *My mom is a teacher.* | **MOM TEACHER SHE.** | Topic = mom; Comment = teacher. |

FSL naturally **drops filler words** like *is*, *am*, or *are*, and uses **visual rhythm and expression** to convey meaning.  
Examples:

* "I am happy." → **I HAPPY.**

* "We are friends." → **WE FRIEND.**

* "He is cooking adobo." → **HE COOK ADOBO.**

Unlike ASL, FSL grammar often includes **localized vocabulary** for cultural references — especially for **places, foods, and emotions**. The way something is signed in Baguio may differ slightly from how it's signed in Davao, and both are correct within their regions.

FSL also features **two types of facial grammar**:

1. **Grammatical Facial Expressions (GFE)** — mark sentence type (e.g., question vs statement).

2. **Affective Facial Expressions (AFE)** — express emotion or tone (e.g., happy, serious, sad).

These work together, so a sentence like "Are you okay?" combines raised eyebrows (GFE) with a concerned face (AFE).

FSL storytelling is also **more visually rich and animated** than ASL. Signers often include cultural gestures, humor, and repetition to emphasize empathy or connection — mirroring the natural liveliness of Filipino conversation.

> 💡 **Tip:** To learn FSL grammar, focus on what you *see*, not what you *say*. Identify the topic, build the comment visually, and let your expressions and body language do the rest.

---

### **Summary for Beginners**

* FSL is a **distinct, full language**, not a signed form of Tagalog or ASL.

* While ASL influenced its roots, FSL developed its **own grammar, vocabulary, and style**.

* The biggest differences are found in **localized terms** (places, food, culture) and **regional dialects**.

* **Facial and body expressions** are even more emphasized in FSL — they are central to meaning.

* **Variation is natural**: different regions sign some concepts differently, and that's okay.

* FSL embodies **Filipino identity** — expressive, warm, and deeply community-centered.`
            },
            {
              id: "lesson-4-practice",
              type: "practice",
              title: "Practice FSL Grammar",
              completed: false,
            },
            {
              id: "lesson-4-quiz",
              type: "quiz",
              title: "Test Your Knowledge",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
  leaderboard: [
    { id: "1", name: "Maria Santos", xp: 3200, change: 5 },
    { id: "2", name: "Juan Cruz", xp: 2950, change: 2 },
    { id: "3", name: "Ana Reyes", xp: 2800, change: -1 },
    { id: "4", name: "Pedro Garcia", xp: 2650, change: 4 },
    { id: "5", name: "Sofia Ramos", xp: 2500, change: 3 },
    { id: "6", name: "Miguel Torres", xp: 2400, change: -2 },
    { id: "7", name: "Isabella Lopez", xp: 2300, change: 1 },
  ],
}

