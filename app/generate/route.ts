import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
    }

    const systemMessage = `You are a course content generation assistant. The user will provide you with:
- A course title
- A course description
- Optional theme colors and fonts

Your task is to generate a JSON object that represents a complete course structure. Each lesson should have adequate text for a full course. The JSON must contain only valid JSON and no additional commentary outside of the JSON object. The JSON must have the following fields:

- "id": string - The unique id for the course.
- "title": string - The title of the course as provided by the user.
- "description": string - The description of the course as provided by the user.
- "modules": array of module objects
    Each module object should have:
      - "id": string - A unique module identifier
      - "title": string - Title of the module
      - "description": string - Description of the module
      - "lessons": array of lesson objects
          Each lesson object should have:
            - "id": string - A unique lesson identifier
            - "title": string - Title of the lesson
            - "content": array of content objects representing the lesson content. Make sure there is enough content for a good length of material. There should be more than a line or two of text. Images need to be paired with text to explain the image, and provide a background or context.
              Each content object could be of "type": "text", "image", and include relevant fields:
                - For "text": { "type": "text", "data": "string of text" }
                - For "image": { "type": "image", "src": "url to image", "alt": "alt text" }
                
      - "quiz": object (optional)
          - "id": string - A unique quiz identifier
          - "questions": array of question objects
              Each question object:
                - "id": string - unique question ID
                - "prompt": string - The question prompt
                - "options": array of option strings
                - "correctIndex": number - zero-based index of correct option
      - "interactiveActivities": array of interactive activity objects (optional)
          Each activity object:
            - "id": string - Unique activity ID
            - "type": string - Activity type (e.g., "matching", "drag-and-drop", "flashcards")
            - "instructions": string - Instructions for the activity
            - "pairs": array of pair objects. Pair objects contain value and a pair properties for the purpose of the different game types. For matching, one value will match with one pair. For drag and drop, the value might be the label, and the pair might be the order it is supposed to be in, for flashcards, value may be the front, and pair might be the back of the flashcard.

- "theme": object
    - Include keys like "primaryColor", "secondaryColor", "fontFamily" etc. depending on the user input

The output must be strictly valid JSON with no additional commentary, explanations, or text outside the JSON object.

Ensure the structure is well-formed and includes a variety of content across lessons, quizzes, and activities. Make use of images or when beneficial. `;

    const prompt = `
The title is "${title}". Generate the course around this, "${description}"
    `;

    const response = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo',
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
    });

    const generatedContent = response.choices[0]?.message?.content || '';
    const course = JSON.parse(generatedContent);

    const courseId = course.id || `course-${Date.now()}`;

    // Save to Firebase Firestore
    const courseRef = doc(collection(db, 'courses'), courseId);
    await setDoc(courseRef, { ...course, id: courseId });

    return NextResponse.json({ courseId });
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json({ error: 'Failed to generate course.' }, { status: 500 });
  }
}