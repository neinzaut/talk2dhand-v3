// Grammar quiz items for ASL and FSL 

export interface GrammarQuizItem {
  id: string
  sentence: string
  correctGloss: string
  rationale: string
  language: "asl" | "fsl"
}

// ASL Quiz Items (15 items from Glossing Practice and Quiz.md)
const aslQuizItems: GrammarQuizItem[] = [
  {
    id: "asl-quiz-1",
    language: "asl",
    sentence: "I washed my car yesterday.",
    correctGloss: "YESTERDAY CAR ME WASH",
    rationale:
      "Time (YESTERDAY) + Topic (CAR) + Subject (ME) + Action (WASH). Use 'ME' for 'I'. ASL follows a Time-Topic-Comment structure where temporal information comes first.",
  },
  {
    id: "asl-quiz-2",
    language: "asl",
    sentence: "Do you want coffee?",
    correctGloss: "COFFEE YOU WANT",
    rationale:
      "Topic (COFFEE) + Subject (YOU) + Verb (WANT). This is a Yes/No question, so eyebrows should be raised. The object/topic is established first.",
  },
  {
    id: "asl-quiz-3",
    language: "asl",
    sentence: "My name is Sarah.",
    correctGloss: "MY NAME SARAH",
    rationale:
      "Possessive (MY) + Noun (NAME) + Fingerspelled Name. Do not use 'IS'. Names are fingerspelled and indicated with fs- prefix.",
  },
  {
    id: "asl-quiz-4",
    language: "asl",
    sentence: "Where is the bathroom?",
    correctGloss: "BATHROOM WHERE",
    rationale:
      "Topic (BATHROOM) + Question Word (WHERE). WH-words go at the end in ASL. Furrowed eyebrows are used over the WH-word.",
  },
  {
    id: "asl-quiz-5",
    language: "asl",
    sentence: "I don't have a dog.",
    correctGloss: "DOG ME HAVE NONE",
    rationale:
      "Topic (DOG) + Subject (ME) + Negation (HAVE NONE). 'HAVE NONE' shows lack of possession in ASL.",
  },
  {
    id: "asl-quiz-6",
    language: "asl",
    sentence: "She is not a teacher.",
    correctGloss: "TEACHER SHE NOT",
    rationale:
      "Topic (TEACHER) + Pronoun (SHE) + Negation (NOT). Negation goes at the end or is shown with a headshake.",
  },
  {
    id: "asl-quiz-7",
    language: "asl",
    sentence: "I am reading a book.",
    correctGloss: "BOOK ME READ",
    rationale:
      "Topic (BOOK) + Subject (ME) + Action (READ). The object is topicalized for emphasis.",
  },
  {
    id: "asl-quiz-8",
    language: "asl",
    sentence: "See you tomorrow.",
    correctGloss: "TOMORROW SEE YOU",
    rationale:
      "Time (TOMORROW) + Action (SEE) + Object (YOU). Time markers typically come first in ASL.",
  },
  {
    id: "asl-quiz-9",
    language: "asl",
    sentence: "I don't understand.",
    correctGloss: "ME UNDERSTAND",
    rationale:
      "Subject (ME) + Verb (UNDERSTAND) + Negation marker. The (neg) notation indicates a headshake is used to show negation.",
  },
  {
    id: "asl-quiz-10",
    language: "asl",
    sentence: "The cat is under the table.",
    correctGloss: "TABLE CAT UNDER",
    rationale:
      "Establish the anchor (TABLE) + Topic (CAT) + Location (UNDER). Setting the reference point first provides spatial context.",
  },
  {
    id: "asl-quiz-11",
    language: "asl",
    sentence: "When is your birthday?",
    correctGloss: "YOUR BIRTHDAY WHEN",
    rationale:
      "Topic (YOUR BIRTHDAY) + WH-Question (WHEN). WH-words are placed at the end with appropriate facial grammar.",
  },
  {
    id: "asl-quiz-12",
    language: "asl",
    sentence: "I prefer tea.",
    correctGloss: "TEA ME PREFER",
    rationale:
      "Topic (TEA) + Subject (ME) + Verb (PREFER). The preferred item is topicalized.",
  },
  {
    id: "asl-quiz-13",
    language: "asl",
    sentence: "My mom is working now.",
    correctGloss: "NOW MY MOM WORK",
    rationale:
      "Time (NOW) + Topic (MY MOM) + Action (WORK). Time-Topic-Comment structure with temporal marker first.",
  },
  {
    id: "asl-quiz-14",
    language: "asl",
    sentence: "Who is that man?",
    correctGloss: "MAN THAT WHO",
    rationale:
      "Point (THAT) + Topic (MAN) + WH-Question (WHO). Use MAN THAT to follow the noun-adjective rule, with WH-word at the end.",
  },
  {
    id: "asl-quiz-15",
    language: "asl",
    sentence: "I have three brothers.",
    correctGloss: "BROTHER ME HAVE THREE",
    rationale:
      "Topic (BROTHER) + Subject (ME) + Action/Quantity (HAVE THREE). The noun is stated first, followed by the quantity.",
  },
]

// FSL Quiz Items (15 items from Glossing Practice and Quiz.md)
const fslQuizItems: GrammarQuizItem[] = [
  {
    id: "fsl-quiz-1",
    language: "fsl",
    sentence: "I don't want rice.",
    correctGloss: "RICE ME AYAW",
    rationale:
      "Topic (RICE) + Subject (ME) + Negation (AYAW). AYAW is used for dislike or refusal, distinguishing it from WALA (absence) and HINDI (denial).",
  },
  {
    id: "fsl-quiz-2",
    language: "fsl",
    sentence: "I have no money.",
    correctGloss: "MONEY ME WALA",
    rationale:
      "Topic (MONEY) + Subject (ME) + Negation (WALA). WALA indicates absence or not having something.",
  },
  {
    id: "fsl-quiz-3",
    language: "fsl",
    sentence: "I am not a doctor.",
    correctGloss: "DOCTOR ME HINDI",
    rationale:
      "Topic (DOCTOR) + Subject (ME) + Negation (HINDI). HINDI is used for denying facts or identity.",
  },
  {
    id: "fsl-quiz-4",
    language: "fsl",
    sentence: "Where do you live?",
    correctGloss: "HOUSE YOU WHERE",
    rationale:
      "Topic (HOUSE/LIVE) + Subject (YOU) + Question (WHERE). WH-words are placed at the end in FSL.",
  },
  {
    id: "fsl-quiz-5",
    language: "fsl",
    sentence: "There is no class today.",
    correctGloss: "TODAY CLASS WALA",
    rationale:
      "Time (TODAY) + Topic (CLASS) + Negation (WALA). WALA indicates the absence of something.",
  },
  {
    id: "fsl-quiz-6",
    language: "fsl",
    sentence: "He is not handsome.",
    correctGloss: "HANDSOME HE HINDI",
    rationale:
      "Topic/Adjective (HANDSOME) + Subject (HE) + Negation (HINDI). HINDI denies the quality or attribute.",
  },
  {
    id: "fsl-quiz-7",
    language: "fsl",
    sentence: "Did you buy the bag?",
    correctGloss: "BAG YOU BUY",
    rationale:
      "Topic (BAG) + Subject (YOU) + Action (BUY). The (q) notation indicates a yes/no question with raised eyebrows.",
  },
  {
    id: "fsl-quiz-8",
    language: "fsl",
    sentence: "I don't know.",
    correctGloss: "KNOW ME HINDI",
    rationale:
      "Verb (KNOW) + Subject (ME) + Negation (HINDI). HINDI is used to negate the knowledge or understanding.",
  },
  {
    id: "fsl-quiz-9",
    language: "fsl",
    sentence: "My father is tall.",
    correctGloss: "FATHER MINE TALL",
    rationale:
      "Topic (FATHER MINE) + Adjective (TALL). FSL shows possession through word sequence rather than apostrophe.",
  },
  {
    id: "fsl-quiz-10",
    language: "fsl",
    sentence: "We will eat later.",
    correctGloss: "LATER EAT WE",
    rationale:
      "Time (LATER) + Action (EAT) + Subject (WE). Time markers come first in FSL grammar.",
  },
  {
    id: "fsl-quiz-11",
    language: "fsl",
    sentence: "Do you have water?",
    correctGloss: "WATER YOU MERON",
    rationale:
      "Topic (WATER) + Subject (YOU) + Possession (MERON). MERON means 'have' or 'exists', the opposite of WALA.",
  },
  {
    id: "fsl-quiz-12",
    language: "fsl",
    sentence: "I want to sleep.",
    correctGloss: "SLEEP ME GUSTO",
    rationale:
      "Topic (SLEEP) + Subject (ME) + Desire (GUSTO). GUSTO expresses desire or wanting, the opposite of AYAW.",
  },
  {
    id: "fsl-quiz-13",
    language: "fsl",
    sentence: "She is not my friend.",
    correctGloss: "FRIEND SHE HINDI",
    rationale:
      "Topic (FRIEND) + Subject (SHE) + Negation (HINDI). HINDI denies the relationship or fact.",
  },
  {
    id: "fsl-quiz-14",
    language: "fsl",
    sentence: "I haven't eaten yet.",
    correctGloss: "EAT ME WALA-PA",
    rationale:
      "Action (EAT) + Subject (ME) + Negation (WALA-PA). Use a hyphen for 'not yet', combining WALA with PA.",
  },
  {
    id: "fsl-quiz-15",
    language: "fsl",
    sentence: "The house is very big.",
    correctGloss: "HOUSE BIG",
    rationale:
      "Topic (HOUSE) + Adjective (BIG). 'Very' is shown by facial expression and intensity, not a separate sign.",
  },
]

export const getQuizItems = (language: "asl" | "fsl"): GrammarQuizItem[] => {
  const quizPool = language === "asl" ? aslQuizItems : fslQuizItems

  // Randomly select 10 items from the pool of 15
  const shuffled = [...quizPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
}
