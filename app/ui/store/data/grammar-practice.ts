// Grammar practice items for ASL and FSL glossing exercises

export interface GrammarPracticeItem {
  id: string
  sentence: string
  correctGloss: string
  rationale: string
  language: "asl" | "fsl"
}

export const grammarPracticeItems: GrammarPracticeItem[] = [
  // ASL Items
  {
    id: "asl-1",
    language: "asl",
    sentence: "How are you?",
    correctGloss: "YOU HOW?",
    rationale:
      "This is a basic WH-question. The pronoun YOU is established first, followed by the WH-sign HOW at the end of the phrase. The essential grammatical component is the non-manual signal for a WH-question (whq): furrowed eyebrows and a slight head tilt forward, held during the sign HOW.",
  },
  {
    id: "asl-2",
    language: "asl",
    sentence: "I went to the store yesterday.",
    correctGloss: "YESTERDAY, STORE ME GO.",
    rationale:
      "This sentence follows the Time-Topic-Comment (TTC) structure. The time element, YESTERDAY, is placed first to establish the temporal context. The topic, STORE, is then established. The comment, ME GO, follows. Note that ASL gloss uses ME for the first-person singular pronoun 'I'.",
  },
  {
    id: "asl-3",
    language: "asl",
    sentence: "My brother's favorite color is blue.",
    correctGloss: "MY BROTHER, IX-poss FAVORITE COLOR WHAT-rhq? BLUE.",
    rationale:
      "This sentence demonstrates topicalization and the use of a rhetorical question. The topic, MY BROTHER, is established first. A question is posed (FAVORITE COLOR WHAT?) and then immediately answered (BLUE). The eyebrows are raised during WHAT (rhq), signaling that the signer is providing, not seeking, information. The sign IX-poss refers to the possessive form of 'his.'",
  },
  {
    id: "asl-4",
    language: "asl",
    sentence: "She doesn't like coffee.",
    correctGloss: "COFFEE, IX-she DON'T-LIKE.",
    rationale:
      "This gloss uses topicalization by moving the object, COFFEE, to the front to make it the topic. The comment IX-she DON'T-LIKE follows. The negation is expressed through the specialized sign DON'T-LIKE, which incorporates negation via reversal of orientation. A negative headshake (n) would accompany this sign.",
  },
  {
    id: "asl-5",
    language: "asl",
    sentence: "Are you a student?",
    correctGloss: "YOU STUDENT YOU?",
    rationale:
      "This is a Yes/No question, which is defined by its non-manual signals. The entire phrase must be accompanied by raised eyebrows, widened eyes, and a forward head tilt (y/n-q). The word order is flexible, but repeating the pronoun YOU at the end is a common way to reinforce the question.",
  },
  {
    id: "asl-6",
    language: "asl",
    sentence: "If it's sunny tomorrow, we will go to the beach.",
    correctGloss: "TOMORROW SUNNY, BEACH WE GO-TO.",
    rationale:
      "This is a conditional statement. The 'if' clause, TOMORROW SUNNY, is treated as the topic and must be accompanied by raised eyebrows (cond). Following a slight pause, the 'then' clause, BEACH WE GO-TO, is signed with a neutral expression. There is no sign for 'if' or 'then.'",
  },
  {
    id: "asl-7",
    language: "asl",
    sentence: "Why did he not come to the party?",
    correctGloss: "PARTY, IX-he NOT COME WHY?",
    rationale:
      "This sentence integrates multiple principles. The topic, PARTY, is established first. The comment IX-he NOT COME WHY? contains both negation and a question. The explicit negative sign NOT is used for clarity, and the WH-word WHY is placed at the end of the sentence, accompanied by furrowed eyebrows (whq).",
  },
  {
    id: "asl-8",
    language: "asl",
    sentence: "The man driving the red car is my father.",
    correctGloss: "RED CAR CL:3-\"drive by\", THAT MAN MY FATHER.",
    rationale:
      "This sentence uses a more complex topic phrase. RED CAR CL:3-'drive by' establishes the topic. CL:3 is a classifier representing a vehicle, and its movement ('drive by') describes the action. This entire phrase functions as the topic. The comment, THAT MAN MY FATHER, identifies the person. Classifiers are a core feature of ASL used to describe the size, shape, location, and movement of nouns.",
  },
  {
    id: "asl-9",
    language: "asl",
    sentence: "We haven't seen that movie yet.",
    correctGloss: "THAT MOVIE, WE SEE NOT-YET.",
    rationale:
      "The object THAT MOVIE is topicalized. The negation is expressed with the compound sign NOT-YET, which is placed at the end of the sentence for emphasis. This is a common placement for time-related negations. A negative headshake (n) would accompany the signs SEE NOT-YET.",
  },
  {
    id: "asl-10",
    language: "asl",
    sentence: "What is your name?",
    correctGloss: "YOUR NAME WHAT?",
    rationale:
      "A standard WH-question. The topic YOUR NAME is established, followed by the WH-sign WHAT at the end. The required non-manual signal is furrowed eyebrows (whq) over the sign WHAT.",
  },

  // FSL Items
  {
    id: "fsl-1",
    language: "fsl",
    sentence: "How are you?",
    correctGloss: "YOU HOW?",
    rationale:
      "This is a WH-question asking about a state of being. The pronoun YOU is established as the topic. The question word HOW is placed at the end of the sentence, which is the standard structure for WH-questions in FSL. The whq notation indicates that the corresponding facial grammar (furrowed eyebrows) must be maintained throughout the signing of the question.",
  },
  {
    id: "fsl-2",
    language: "fsl",
    sentence: "I will go to school tomorrow.",
    correctGloss: "TOMORROW, SCHOOL, IX-me GO-TO.",
    rationale:
      "This sentence is organized according to the Time-Topic-Comment (TTC) rule. The specific time marker TOMORROW is placed first to establish the temporal frame. SCHOOL is the topic, followed by the comment IX-me GO-TO. The sign for 'go to' is a single directional sign, glossed as GO-TO.",
  },
  {
    id: "fsl-3",
    language: "fsl",
    sentence: "Do you understand?",
    correctGloss: "YOU UNDERSTAND?",
    rationale:
      "This is a yes/no question. The topic is YOU. The comment is UNDERSTAND. The question mark in the gloss and, more importantly, the q notation above the gloss, indicate that this is a yes/no question requiring the appropriate non-manual signal. The Filipino question marker 'ba' is not signed; its grammatical function is fulfilled by the non-manual signal.",
  },
  {
    id: "fsl-4",
    language: "fsl",
    sentence: "My mother is not a teacher.",
    correctGloss: "MY MOTHER, TEACHER.",
    rationale:
      "MY MOTHER is the topic, marked with the t non-manual signal. The comment is TEACHER. The negation is accomplished grammatically by the n non-manual signal (headshake) performed simultaneously while signing TEACHER. Using the non-manual signal alone is a more natural and efficient way to express negation.",
  },
  {
    id: "fsl-5",
    language: "fsl",
    sentence: "I am hungry.",
    correctGloss: "IX-me HUNGRY.",
    rationale:
      "In simple sentences, FSL can use an SVO or SV order that resembles English. Here, IX-me is the subject/topic, and HUNGRY is the comment. No special non-manual signals are required for this basic statement, though the facial expression should naturally match the feeling of being hungry.",
  },
  {
    id: "fsl-6",
    language: "fsl",
    sentence: "What is your name?",
    correctGloss: "YOUR NAME WHAT?",
    rationale:
      "This is a WH-question. The topic YOUR NAME is established first. The question word WHAT is placed at the end, consistent with FSL syntax for WH-questions. The entire phrase is signed with the whq facial grammar (furrowed eyebrows).",
  },
  {
    id: "fsl-7",
    language: "fsl",
    sentence: "I went to the park last week.",
    correctGloss: "LAST-WEEK, PARK, IX-me GO-TO.",
    rationale:
      "The sentence follows the Time-Topic-Comment (TTC) structure. LAST-WEEK sets the past time frame. PARK is the topic. IX-me GO-TO is the comment describing the action. LAST-WEEK is a compound sign represented by hyphenated words in the gloss.",
  },
  {
    id: "fsl-8",
    language: "fsl",
    sentence: "My father's car is blue.",
    correctGloss: "MY FATHER CAR, BLUE.",
    rationale:
      "The topic is the entire noun phrase MY FATHER CAR, which is established with the t non-manual signal. The comment is the simple adjective BLUE. FSL does not use an apostrophe 's' for possession; the relationship is shown by the sequence of the signs.",
  },
  {
    id: "fsl-9",
    language: "fsl",
    sentence: "Where is the bathroom?",
    correctGloss: "CR WHERE?",
    rationale:
      "This is a WH-question asking for a location. The topic, CR (a common term for bathroom in FSL), is signed first. The question word WHERE follows at the end. The whq non-manual signal (furrowed brows) is essential for marking this as a question.",
  },
  {
    id: "fsl-10",
    language: "fsl",
    sentence: "The students study every day.",
    correctGloss: "EVERYDAY, STUDENT, STUDY++.",
    rationale:
      "The time marker EVERYDAY is placed first. STUDENT is the topic. The verb STUDY is repeated to convey the meaning of 'every day' or habitual action, which is indicated in the gloss with the ++ notation.",
  },
]

export const getLanguagePracticeItems = (language: "asl" | "fsl"): GrammarPracticeItem[] => {
  const langItems = grammarPracticeItems.filter((item) => item.language === language)
  // Randomly select 5 items from practice pool
  const shuffled = [...langItems].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}
