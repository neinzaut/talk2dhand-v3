import type { LanguageData } from "../types"

export const aslData: LanguageData = {
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      description: "Basics of American Sign Language",
      progress: 40,
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Alphabets",
          subtitle: "Learn how to sign letters!",
          icon: "aα\naA",
          thumbnail: "/icons/alphabets.png",
          completed: true,
          progress: 100,
          signs: [
            { id: "a", label: "A", imageUrl: "/images/asl-labelled/a.png" },
            { id: "b", label: "B", imageUrl: "/images/asl-labelled/b.png" },
            { id: "c", label: "C", imageUrl: "/images/asl-labelled/c.png" },
            { id: "d", label: "D", imageUrl: "/images/asl-labelled/d.png" },
            { id: "e", label: "E", imageUrl: "/images/asl-labelled/e.png" },
            { id: "f", label: "F", imageUrl: "/images/asl-labelled/f.png" },
            { id: "g", label: "G", imageUrl: "/images/asl-labelled/g.png" },
            { id: "h", label: "H", imageUrl: "/images/asl-labelled/h.png" },
            { id: "i", label: "I", imageUrl: "/images/asl-labelled/i.png" },
            { id: "j", label: "J", imageUrl: "/images/asl-labelled/j.png" },
            { id: "k", label: "K", imageUrl: "/images/asl-labelled/k.png" },
            { id: "l", label: "L", imageUrl: "/images/asl-labelled/l.png" },
            { id: "m", label: "M", imageUrl: "/images/asl-labelled/m.png" },
            { id: "n", label: "N", imageUrl: "/images/asl-labelled/n.png" },
            { id: "o", label: "O", imageUrl: "/images/asl-labelled/o.png" },
            { id: "p", label: "P", imageUrl: "/images/asl-labelled/p.png" },
            { id: "q", label: "Q", imageUrl: "/images/asl-labelled/q.png" },
            { id: "r", label: "R", imageUrl: "/images/asl-labelled/r.png" },
            { id: "s", label: "S", imageUrl: "/images/asl-labelled/s.png" },
            { id: "t", label: "T", imageUrl: "/images/asl-labelled/t.png" },
            { id: "u", label: "U", imageUrl: "/images/asl-labelled/u.png" },
            { id: "v", label: "V", imageUrl: "/images/asl-labelled/v.png" },
            { id: "w", label: "W", imageUrl: "/images/asl-labelled/w.png" },
            { id: "x", label: "X", imageUrl: "/images/asl-labelled/x.png" },
            { id: "y", label: "Y", imageUrl: "/images/asl-labelled/y.png" },
            { id: "z", label: "Z", imageUrl: "/images/asl-labelled/z.png" },
          ],
          subLessons: [
            {
              id: "lesson-1-content",
              type: "content",
              title: "Learn About the ASL Alphabet",
              completed: true,
              content: `### **Lesson 1: ASL Alphabet (Fingerspelling)**

The ASL alphabet uses one hand to represent the 26 letters of the English alphabet. It originated from the French Sign Language (LSF) manual alphabet and differs from two-handed systems like British Sign Language (BSL). Some letters—such as **E**, **S**, and **T**—may vary slightly in hand tension or palm orientation between signers. Motion letters like **J** and **Z** trace shapes in the air. These small differences don't change meaning; clarity matters most. Fingerspelling is used for names, technical terms, and words without established signs. Maintain steady, clear movements within your neutral space.

The ASL alphabet uses **one hand** to represent the 26 letters of the English alphabet. Each handshape stands for a specific letter — together, they form what we call **fingerspelling**. You'll use it for names, places, or words that don't have a specific sign (like *pizza* or *Wi-Fi*).

**FUN FACT:** ASL's alphabet came from **French Sign Language (LSF)** in the 1800s and is now used across the United States and parts of Canada. This makes it different from systems like **British Sign Language (BSL)**, which uses **two hands** for letters—so even if two countries speak English, their sign languages are not the same.

While there is **no single global sign language**, **ASL is one of the most widely recognized** because it is well-documented, used in international Deaf events, and widely represented in education, research, and media.

Many sign languages in **Southeast Asia**—including **Thai Sign Language (TSL)**—have been influenced by ASL through Deaf education programs, missionary efforts, and language training led by American-trained teachers in the 20th century. This contact led to a blending of local sign varieties with ASL-based systems.

| STATIC SIGN | DYNAMIC SIGN |
| :---- | :---- |
| A static sign is one in which the handshape, orientation, and location are held in a fixed position (no movement). | A dynamic sign is one that involves motion — the hand moves, changes shape, or travels through space. The beginning and end handshapes or movement path are important. |

In the alphabet, most letters are **static** (A, B, C, etc.), but **J** and **Z** are **dynamic**, as you trace their shapes in the air. Some letters, like **E**, **S**, and **T**, can look slightly different between signers—the hand may be tighter, looser, or tilted a bit. That's okay! Small differences don't change meaning; what matters most is **clarity and consistency**.

Knowing the difference between static and dynamic signs is helpful when practicing or designing recognition systems: dynamic signs rely on timing and movement, while static ones depend on accurate handshape and orientation.

When fingerspelling, keep your hand at **chest to shoulder height**, relaxed, and facing your conversation partner. Avoid waving or bouncing your arm. If you make a mistake, simply pause and start again.

> 💡 **Tip:** Don't worry about speed! Slow and clear spelling is better understood than fast, messy movements.`
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
          title: "Lesson 2: Numbers",
          subtitle: "Learn how to sign numbers!",
          icon: "1️⃣2️⃣\n3️⃣4️⃣",
          thumbnail: "/icons/numbers.png",
          completed: false,
          progress: 60,
          signs: [
            { id: "0", label: "0", imageUrl: "/images/asl-labelled/0.png" },
            { id: "1", label: "1", imageUrl: "/images/asl-labelled/1.png" },
            { id: "2", label: "2", imageUrl: "/images/asl-labelled/2.png" },
            { id: "3", label: "3", imageUrl: "/images/asl-labelled/3.png" },
            { id: "4", label: "4", imageUrl: "/images/asl-labelled/4.png" },
            { id: "5", label: "5", imageUrl: "/images/asl-labelled/5.png" },
            { id: "6", label: "6", imageUrl: "/images/asl-labelled/6.png" },
            { id: "7", label: "7", imageUrl: "/images/asl-labelled/7.png" },
            { id: "8", label: "8", imageUrl: "/images/asl-labelled/8.png" },
            { id: "9", label: "9", imageUrl: "/images/asl-labelled/9.png" },
            { id: "10", label: "10", imageUrl: "/images/asl-labelled/10.png" },
          ],
          subLessons: [
            {
              id: "lesson-2-content",
              type: "content",
              title: "Learn About ASL Numbers",
              completed: true,
              content: `### **Lesson 2: ASL Numbers**

In ASL, numbers are typically formed with one hand—much like the early letters of the alphabet. In fact, notice how **1, 2, 3, 4, 5** in ASL closely resemble the handshapes of the early alphabet letters such as **I**, **V**, and **W**.

ASL numbers follow consistent patterns for counting, time, and age. The ASL number system differs from many other sign languages that use two hands.

Here's how ASL numbers work:

* **1 to 5:** Use a static handshape similar to the first few letters; the palm often faces *inward* (toward your body). This is one of the biggest differences from other sign languages, such as BSL or FSL, where the palm usually faces outward.  
* **6 to 9:** The thumb touches different fingertips (6 = thumb + pinky, 7 = thumb + ring finger, etc.). Some signers slightly rotate their palm or adjust finger spacing depending on comfort or region—these are perfectly acceptable **personal or regional variations**.  
* **11 to 19:** Add a small motion (bounce or flick) to indicate the "teen" component.  
* **Larger numbers:** Combine smaller signs smoothly (for example, 23 is "2" then "3" in one motion).

As with the alphabet, small **variations** in palm rotation, spacing, or motion are common. These are fine as long as the meaning stays clear. Keep your movements **compact and precise** so numbers aren't mistaken for letters or other handshapes.

> 💡 **Tip:** Consider context—the same "3" may look slightly different when saying "3 o'clock" versus "3 people," and that's normal.`
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
          title: "Lesson 3: Phrases",
          subtitle: "Learn how to sign words or phrases!",
          icon: "❓",
          thumbnail: "/icons/phrases.png",
          completed: false,
          progress: 0,
          signs: [
            { id: "bad", label: "Bad", imageUrl: "/gifs/bad.gif" },
            { id: "drink", label: "Drink", imageUrl: "/gifs/drink-c.gif" },
            { id: "fine", label: "Fine", imageUrl: "/gifs/fine.gif" },
            { id: "food", label: "Food", imageUrl: "/gifs/food.gif" },
            { id: "go", label: "Go", imageUrl: "/gifs/go.gif" },
            { id: "happy", label: "Happy", imageUrl: "/gifs/happy.gif" },
            { id: "have", label: "Have", imageUrl: "/gifs/have.gif" },
            { id: "hesheit", label: "He/She/It", imageUrl: "/gifs/he-she-it.gif" },
            { id: "hello", label: "Hello", imageUrl: "/gifs/hello.gif" },
            { id: "like", label: "Like", imageUrl: "/gifs/like.gif" },
            { id: "minemy", label: "My/Mine", imageUrl: "/gifs/my-mine.gif" },
            { id: "not", label: "Not", imageUrl: "/gifs/not.gif" },
            { id: "now", label: "Now", imageUrl: "/gifs/now.gif" },
            { id: "sad", label: "Sad", imageUrl: "/gifs/sad.gif" },
            { id: "see", label: "See", imageUrl: "/gifs/see.gif" },
            { id: "thankyou", label: "Thank You", imageUrl: "/gifs/thankyou.gif" },
            { id: "weus", label: "We/Us", imageUrl: "/gifs/we-us.gif" },
            { id: "where", label: "Where", imageUrl: "/gifs/where.gif" },
            { id: "will", label: "Will", imageUrl: "/gifs/will.gif" },
            { id: "yourself", label: "Yourself", imageUrl: "/gifs/you.gif" },
          ],
          subLessons: [
            {
              id: "lesson-3-content",
              type: "content",
              title: "Learn About ASL Phrases",
              completed: false,
              videos: [
                { label: "Watch this short video to see how facial expressions, eye gaze, and body posture work together in real ASL conversation. Notice how each phrase combines hand movements with emotion and rhythm — this helps you understand not just what is being signed, but how meaning is expressed.", youtubeId: "uKKvNqA9N20" },
              ],
              content: `### **Lesson 3: ASL Phrases**

ASL phrases don't follow English word-for-word order. Instead, ASL has its own grammar. For example, "How are you?" becomes **YOU HOW?** in ASL order.

A huge part of meaning in ASL comes from **facial expressions, head position, body posture, and eye gaze**—collectively known as **non-manual signals (NMS)**. In ASL, the **face is grammar**.

**Examples:**

* **Yes/No questions:** Raise your eyebrows and tilt your head slightly.

* **Wh-questions (who, what, where, why):** Furrow your eyebrows and lean forward.

* **Emphasis or contrast:** Lean your body or shift your torso.

* **Referencing people or objects:** Use your eyes and head direction to point toward them in signing space.

Because NMS are essential, the correct handshape alone isn't enough—your facial and body grammar must match. Both dynamic facial expressions and timing affect meaning in ASL.

Familiar phrases like **HELLO** and **THANK YOU** are widely known, but communities may sign them with slightly different motions or emphasis.

#### **Visual Examples**

Below are animated examples of the phrases you'll practice:

| Sign | Animation | Sign | Animation |
| :---- | :----: | :---- | :----: |
| **Bad** | ![Bad](/gifs/bad.gif) | **Drink** | ![Drink](/gifs/drink-c.gif) |
| **Fine** | ![Fine](/gifs/fine.gif) | **Food** | ![Food](/gifs/food.gif) |
| **Go** | ![Go](/gifs/go.gif) | **Happy** | ![Happy](/gifs/happy.gif) |
| **Have** | ![Have](/gifs/have.gif) | **He/She/It** | ![He/She/It](/gifs/he-she-it.gif) |
| **Hello** | ![Hello](/gifs/hello.gif) | **Like** | ![Like](/gifs/like.gif) |
| **My/Mine** | ![My/Mine](/gifs/my-mine.gif) | **Not** | ![Not](/gifs/not.gif) |
| **Now** | ![Now](/gifs/now.gif) | **Sad** | ![Sad](/gifs/sad.gif) |
| **See** | ![See](/gifs/see.gif) | **Thank You** | ![Thank You](/gifs/thank-you.gif) |
| **Thanks** | ![Thanks](/gifs/thankyou.gif) | **Today** | ![Today](/gifs/today.gif) |
| **We/Us** | ![We/Us](/gifs/we-us.gif) | **Where** | ![Where](/gifs/where.gif) |
| **Will** | ![Will](/gifs/will.gif) | **You** | ![You](/gifs/you.gif) |

Notice how the hand movements flow naturally and include appropriate facial expressions. Practice these signs slowly at first, focusing on proper form and expression.

> 💡 **Tip:** Practice full-body signing—hands, face, and posture work together. Don't sign with a blank face; your expressions complete the sentence. ASL is expressive, visual, and alive! Your face and hands work together to communicate meaning!`
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
          title: "Lesson 4: Grammar",
          subtitle: "Learn grammar and syntax in sign!",
          icon: "📝",
          thumbnail: "/icons/grammar.png",
          completed: false,
          progress: 0,
          signs: [],
          subLessons: [
            {
              id: "lesson-4-content",
              type: "content",
              title: "Learn About ASL Grammar",
              completed: false,
              content: `### **Lesson 4: ASL Grammar and Structure**

ASL is a full language with its own **syntax, morphology, and grammar** — it is *not* just English translated to hands. 

#### **Topic–Comment Order & Examples**

A key structure in ASL is **Topic–Comment**. In this structure, you first introduce the **topic** (what or who you're talking about), then follow with the **comment** (what you want to say about it).

| English | ASL-like gloss | Meaning |
| ----- | ----- | ----- |
| *I am going to school today.* | **TODAY SCHOOL I GO** | The topic is *today school*, then the comment *I go*. |
| *Where do you live?* | **YOU LIVE WHERE?** | Topic = you live, comment = where? |
| *My mom is a teacher.* | **MOM TEACHER SHE or MOM TEACHER** | Topic = mom, comment = teacher, optional pronoun. |

#### **Shortening in ASL**

Everyday ASL often drops unnecessary words—especially those implied by context.  
Examples:

* "I am going to school." → **SCHOOL I GO.**

* "He is hungry." → **HE HUNGRY.** (omit *is*)

* "She is reading a book." → **SHE READ BOOK.**

You can shorten a sentence whenever the meaning remains clear. The rule of thumb: remove what the viewer can already infer, but always keep the **topic** and **main idea**.

#### **Figuring Out ASL Grammar as a Learner**

1. **Identify the topic**—what is this about?

2. **State your comment**—what do you want to say about it?

3. **Use space and referencing:** assign areas in signing space for people or things and point back instead of repeating names.

4. **Watch for NMS:** facial and body cues show question type, emotion, and emphasis.

5. **Observe native signers:** exposure helps you internalize rhythm, order, and natural reduction.

**More examples:**

* *Do you want coffee or tea?* → **YOU WANT COFFEE OR TEA?**

* *I saw Juan at the mall yesterday.* → **YESTERDAY MALL JUAN I SEE.**

* *Where is your house?* → **YOUR HOUSE WHERE**

ASL also uses **spatial referencing**—placing people or objects in signing space and pointing back to those spots instead of repeating names.

**Non-manual signals (NMS)**—facial expressions, head shifts, and body movement—are part of grammar. They can turn a statement into a question, add emphasis, or show emotion.

Minor variations in space use or timing are **stylistic**, reflecting regional and personal expression.

Most importantly, ASL is a **complete, living language** with its own slang, storytelling, and poetry. It isn't a simplified form of English—it's the visual voice of the Deaf community.

> 💡 **Tip:** Watch Deaf signers online or in person to see how they naturally use space and facial expression. You'll learn not just what ASL says, but *how* it says it.`
            },
            {
              id: "lesson-4-practice",
              type: "grammar-practice",
              title: "Practice ASL Grammar",
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
    { id: "1", name: "Alex Johnson", xp: 3200, change: 5 },
    { id: "2", name: "Sarah Williams", xp: 2950, change: 2 },
    { id: "3", name: "Michael Brown", xp: 2800, change: -1 },
    { id: "4", name: "Emily Davis", xp: 2650, change: 4 },
    { id: "5", name: "David Miller", xp: 2500, change: 3 },
    { id: "6", name: "Jessica Wilson", xp: 2400, change: -2 },
    { id: "7", name: "Christopher Moore", xp: 2300, change: 1 },
  ],
}

