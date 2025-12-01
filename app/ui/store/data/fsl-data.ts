import type { LanguageData } from "../types"

export const fslData: LanguageData = {
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      description: "Basics of Filipino Sign Language",
      progress: 0,
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Alpabeto",
          subtitle: "Matuto kung paano mag-sign ng mga titik!",
          icon: "aα\naA",
          thumbnail: "/icons/alphabets.png",
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
          thumbnail: "/icons/numbers.png",
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
            { id: "10", label: "10", imageUrl: "/images/fsl-labelled/10.png", hidden: true },
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
          title: "Lesson 3: Mga Salita",
          subtitle: "Matuto kung paano mag-sign ng mga salita!",
          icon: "❓",
          thumbnail: "/icons/phrases.png",
          completed: false,
          progress: 0,
          signs: [
            { id: "bad", label: "Masama", imageUrl: "bad.gif" },
            { id: "drink-c", label: "Inumin", imageUrl: "drink-c.gif" },
            { id: "fine", label: "Mabuti", imageUrl: "fine.gif" },
            { id: "food", label: "Pagkain", imageUrl: "food.gif", hidden: true },
            { id: "go", label: "Pumunta", imageUrl: "go.gif", hidden: true },
            { id: "happy", label: "Masaya", imageUrl: "happy.gif" },
            { id: "have", label: "Mayroon", imageUrl: "have.gif" },
            { id: "he-she-it", label: "Siya", imageUrl: "he-she-it.gif" },
            { id: "hello", label: "Kumusta", imageUrl: "hello.gif" },
            { id: "like", label: "Gusto", imageUrl: "like.gif" },
            { id: "my-mine", label: "Akin", imageUrl: "my-mine.gif" },
            { id: "not", label: "Hindi", imageUrl: "not.gif" },
            { id: "now", label: "Ngayon", imageUrl: "now.gif" },
            { id: "sad", label: "Malungkot", imageUrl: "sad.gif" },
            { id: "see", label: "Makita", imageUrl: "see.gif" },
            { id: "thank-you", label: "Salamat", imageUrl: "thank-you.gif" },
            { id: "we-us", label: "Kami/Tayo", imageUrl: "we-us.gif" },
            { id: "where", label: "Saan", imageUrl: "where.gif" },
            { id: "will", label: "Gagawin", imageUrl: "will.gif" },
            { id: "today", label: "Ngayong Araw", imageUrl: "today.gif", hidden: true },
            { id: "yourself", label: "Sarili", imageUrl: "yourself.gif" }
          ],
          subLessons: [
            {
              id: "lesson-3-content",
              type: "content",
              title: "Learn About FSL Common Phrases",
              completed: false,
              videos: [
                { label: "Watch this short video to see how facial expressions, eye gaze, and body posture work together in real FSL conversation. Notice how each phrase combines hand movements with emotion and rhythm — this helps you understand not just what is being signed, but how meaning is expressed.", youtubeId: "Y1IfQ4DuQxU" },
              ],
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

#### **Mga Halimbawa ng Visual (Visual Examples)**

Narito ang mga animated na halimbawa ng mga salitang iyong masasanay:

| Tanda | Animasyon | Tanda | Animasyon |
| :---- | :----: | :---- | :----: |
| **Masama** | ![Bad](/gifs/fsl/bad.gif) | **Inumin** | ![Drink](/gifs/fsl/drink-c.gif) |
| **Ayos** | ![Fine](/gifs/fsl/fine.gif) | **Pagkain** | ![Food](/gifs/fsl/food.gif) |
| **Pumunta** | ![Go](/gifs/fsl/go.gif) | **Masaya** | ![Happy](/gifs/fsl/happy.gif) |
| **Mayroon** | ![Have](/gifs/fsl/have.gif) | **Siya** | ![He/She/It](/gifs/fsl/he-she-it.gif) |
| **Kumusta** | ![Hello](/gifs/fsl/hello.gif) | **Gusto** | ![Like](/gifs/fsl/like.gif) |
| **Akin** | ![My/Mine](/gifs/fsl/my-mine.gif) | **Hindi** | ![Not](/gifs/fsl/not.gif) |
| **Now** | ![Now](/gifs/fsl/now.gif) | **Malungkot** | ![Sad](/gifs/fsl/sad.gif) |
| **Makita** | ![See](/gifs/fsl/see.gif) | **Salamat Po** | ![Thank You](/gifs/fsl/thank-you.gif) |
| **Tayo/Kami** | ![We/Us](/gifs/fsl/we-us.gif) | **Saan** | ![Where](/gifs/fsl/where.gif) |
| **Gagawin** | ![Will](/gifs/fsl/will.gif) | **Ikaw** | ![You](/gifs/fsl/yourself.gif) |

Pansinin kung paano natural na umaagos ang mga paggalaw ng kamay at may kasamang naaangkop na mga pagpapahayag sa mukha. Magsanay ng mga tandang ito nang dahan-dahan sa una, na nakatuon sa wastong anyo at pagpapahayag.

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
          thumbnail: "/icons/grammar.png",
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

FSL grammar is uniquely Filipino. Like ASL, it follows a **Topic–Comment** structure — but with Filipino cultural influences that emphasize context, emotion, and storytelling.


### **Understanding Glossing**

Before we explore grammar, let's understand **glossing** — a system that helps us write down FSL signs using written words as labels.

#### **Core Glossing Conventions**

| Convention | Example |
| ----- | ----- |
| **CAPITALIZATION** | **HOUSE** (the sign for "bahay") |
| **Fingerspelling** | **M-A-N-I-L-A** (spelled letter by letter) |
| **Lexicalized Signs** | **#BUSY**, **#DO**, **#PIZZA** (fingerspelling that became a sign) |
| **Compound Signs** | **GOOD-MORNING**, **MOTHER-FATHER** (multiple words = one sign) |
| **Non-Manual Signals** | Facial expressions shown as **(q)** for question, **(neg)** for negation |

**Remember:** Glossing is a learning tool to understand FSL structure!


### **Basic Sentence Structure**

#### **Topic–Comment Order**

FSL typically follows a **Topic–Comment** pattern:
1. **Topic** = What/who you're talking about
2. **Comment** = What you want to say about it

**Examples:**

| English | FSL Gloss |
| ----- | ----- |
| I'm going to school today. | **TODAY SCHOOL I GO** |
| Where do you live? | **HOUSE YOU WHERE** |
| My mom is a teacher. | **MOM TEACHER** |

#### **Shortening Sentences**

FSL drops filler words like *is*, *am*, *are*:

* "I am happy." → **I HAPPY**
* "We are friends." → **WE FRIEND**
* "He is cooking adobo." → **HE COOK ADOBO**


### **FSL's Unique Negation System**

FSL has **three specific negation signs** — you must choose the right one!

**1. HINDI (NOT)** — for denying facts or identity
* **DOCTOR ME HINDI** = I am not a doctor
* **HANDSOME HE HINDI** = He is not handsome
* **KNOW ME HINDI** = I don't know

**2. WALA (NONE)** — for absence or not having
* **MONEY ME WALA** = I have no money
* **TODAY CLASS WALA** = There is no class today
* **EAT ME WALA-PA** = I haven't eaten yet

**3. AYAW (DON'T-WANT)** — for refusal or dislike
* **RICE ME AYAW** = I don't want rice

**Positive forms:**
* **GUSTO** (want) — opposite of AYAW
* **MERON** (have/exists) — opposite of WALA


### **Conditional Statements (If/Then)**

Like ASL, FSL doesn't use manual signs for "if" or "then" — it's shown through facial expressions!

**How it works:**
* Raise your eyebrows during the "if" part
* Then sign the "then" part with a neutral face

**Examples:**
* **(cond) RAIN FINISH, ME GO** = If the rain stops, I'll go
* **(cond) TOMORROW SUNNY, BEACH WE GO** = If tomorrow is sunny, we'll go to the beach


### **What Makes FSL Special**

✓ **Distinct language** — not just signed Tagalog or ASL

✓ **Regional variations** — Baguio and Davao may sign differently (both correct!)

✓ **Cultural vocabulary** — special signs for Filipino food, places, emotions

✓ **Expressive storytelling** — more animated with cultural gestures

✓ **Two types of facial expressions:**
  - **GFE** (Grammatical) — marks questions, statements
  - **AFE** (Affective) — shows emotion and tone

> 💡 **Tip:** FSL is visual and cultural. Focus on what you *see*, not what you *say*. Let your expressions and body language tell the story!`
            },
            {
              id: "lesson-4-practice",
              type: "grammar-practice",
              title: "Practice FSL Grammar",
              completed: false,
            },
            {
              id: "lesson-4-quiz",
              type: "grammar-practice",
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

