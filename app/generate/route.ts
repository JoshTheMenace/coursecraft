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

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;



// Fetch image URL from Google Custom Search API
async function fetchImageUrlFromGoogle(altText: string): Promise<string> {
  const query = encodeURIComponent(altText);
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&searchType=image&q=${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Google Image Search API error:', await res.text());
      return 'https://via.placeholder.com/600x400?text=No+Image+Found'; // fallback
    }
    const data = await res.json();
    console.log('Google Image Search API response:', data);
    // Extract the first image link if available
    const firstItem = data.items?.[0];
    const imageUrl = firstItem?.link || 'https://via.placeholder.com/600x400?text=No+Image+Found';
    return imageUrl;
  } catch (err) {
    console.error('Error fetching image from Google:', err);
    return 'https://via.placeholder.com/600x400?text=Error';
  }
}

// Traverse and replace image SRCs
async function replaceImageSrcs(course: any) {
  if (!course.modules) return course;

  for (const module of course.modules) {
    if (module.lessons) {
      for (const lesson of module.lessons) {
        if (lesson.content) {
          for (const contentItem of lesson.content) {
            if (contentItem.type === 'image' && contentItem.alt) {
              const newUrl = await fetchImageUrlFromGoogle(contentItem.alt);
              contentItem.src = newUrl;
            }
          }
        }
      }
    }
    // If you'd like, handle images in quizzes or interactive activities similarly.
    // For now, we assume only lessons have images.
  }

  return course;
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
    }

    const COURSE_TITLE = title;
    const COURSE_DESCRIPTION = description

    const systemMessage = `You are an expert course developer. I want you to produce a detailed, professional, and substantial course outline. Do not include lengthy or detailed lesson text; instead, provide rich outlines, titles, lesson templates, and placeholders where the text would go. The course must have at least 4 modules modules, but feel free to include more. Each module must have multiple lessons. Each lesson must have a good amount of lesson text content blocks, and can include images in image blocks. Each module also must have at least a quiz or an interactive activity. Ensure the course is logically organized, covers a significant breadth of topics, and is worth purchasing.

<<<<<<< HEAD
    Include quizes, lessons, and activities to help educate the users. Activities will be a matching game to match the pairs together. The outline should be able to be used to start creating a very useful and note worthy course. Do not provide too much detail at this point, a rich outline will do.
    Do not include videos in the course outline.
    Use these variables:
    
    Include multiple modules, each with multiple lessons (but keep lesson content minimal, placeholders only).
    Example of lesson content:
    Lesson 1: Introduction to the topic 
    content topics: 
    - What is the topic about?
    - Why is it important?
    Image: [Image of the topic]
    - How does it relate to other topics?
    - Brief history of the topic.
      
    Keep the quizzes and interactive activities with placeholder questions/pairs, but do not fill them with full text explanations.
    Make sure the JSON has no syntax errors and that the final output is only the JSON. Do not include the backtics or specify that the content is json.
    Maintain the structure precisely, with valid JSON output only (no extra text outside the JSON).
`;

const secondPrompt = (outline: string) => {
  return `Using a valid JSON structure identical the one specified below, now add comprehensive lesson text, detailed descriptions, and rich educational content to each lesson, quiz explanation, and interactive activity instruction. The goal is to make the course feel substantial, professional, and worth purchasing.
Course outline:
${outline}
=======
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
            Don't feel required to have an image in each lesson, but where it would make sense to have one.
                
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
            - "type": string - Activity type ("matching", "drag-and-drop")
            - "instructions": string - Instructions for the activity
            - "pairs": array of pair objects. Pair objects contain value and a pair properties for the purpose of the different game types. For matching, one value will match with one pair. For drag and drop, the value might be the label, and the pair might be the order it is supposed to be in, for flashcards, value may be the front, and pair might be the back of the flashcard.

    Make sure to include at least 2 quizes or interactive activities in the course. The course should have at least 4 modules with 3 lessons each.
- "theme": object
    - Include keys like "primaryColor", "secondaryColor", "fontFamily" etc. depending on the user input
>>>>>>> d4d95ca980035bcfc3c9db4e5f103e12b39a7dfd


    {
  "id": "<unique-course-id>",
  "title": "{COURSE_TITLE}",
  "subtitle": "{COURSE_SUBTITLE}",
  "description": "<High-level course description>",
  "instructor": {
    "name": "",
    "bio": "",
    "avatar": "",
    "socialLinks": {
      "twitter": "",
      "linkedin": ""
    }
  },
  "language": "en-US",
  "level": "{LEVEL}",
  "tags": [
    "{TOPIC}",
    "<additional-tag>"
  ],
  "dateCreated": "<ISO 8601 date>",
  "lastUpdated": "<ISO 8601 date>",
  "status": "published",
  "version": "1.0.0",
  "pricing": {
    "isFree": false,
    "cost": 0,
    "currency": "{CURRENCY}",
    "discount": 0
  },
  "stats": {
    "views": 0,
    "likes": 0,
    "enrollments": 0,
    "completions": 0,
    "averageRating": 0,
    "ratingsCount": 0
  },
  "modules": [
    {
      "id": "<module-id-1>",
      "title": "<Module 1 Title>",
      "description": "<Module 1 high-level description>",
      "learningObjectives": [
        "<Objective 1>",
        "<Objective 2>",
        "<Objective 3>"
      ],
      "lessons": [
        {
          "id": "<lesson-id-1-1>",
          "title": "<Lesson 1 Title>",
          "content": [
            {
              "type": "text",
              "data": "<Placeholder for lesson content (make sure its lengthy and detailed. Go into depth)>"
            },
            {
              "type": "image",
              "data": "https://example.com/image.jpg",
              "alt": "<Image description>"
            },
            {
              "type": "text",
              "data": "<Another placeholder for lesson content (make sure its lengthy and detailed. Go into depth)>"
            }
            // feel free to add more text content items here (at least 3-5 per lesson)
          ]
        }
      ],
      "quiz": {
        "id": "<quiz-id-1>",
        "questions": [
          {
            "id": "<question-id-1-1>",
            "prompt": "<Quiz question placeholder>",
            "options": [
              "<Option 1>",
              "<Option 2>",
              "<Option 3>",
              "<Option 4>"
            ],
            "correctIndex": 0,
            "explanation": "<Placeholder explanation>"
          }
        ],
        "passingScore": 80,
        "timeLimit": 300
      },
      "interactiveActivities": [
        {
          "id": "<activity-id-1>",
          "type": "matching",
          "instructions": "<Placeholder instructions>",
          "pairs": [
            {
              "value": "<item>",
              "pair": "<matching-item>"
            }
          ]
        }
      ],
      "resources": [
        {
          "type": "pdf",
          "title": "<Module 1 Resource Title>",
          "url": "<URL>"
        }
      ]
    }
    // Add multiple modules here with the same structure
  ],
  "resources": [
    {
      "type": "pdf",
      "title": "<Course-level Resource Title>",
      "url": "<URL>"
    },
    {
      "type": "video",
      "title": "<Course-level Resource Title>",
      "url": "<URL>"
    }
  ],
  "theme": {
    "primaryColor": "#1E90FF",
    "secondaryColor": "#FFFFFF",
    "backgroundColor": "#F5F5F5",
    "fontFamily": "Arial, sans-serif"
  }
}

    Keep the same structure but fill in:
        lesson content: multiple text contents of detailed, informative text that educates the learner on the topic.
        module descriptions: expand them to be thorough and engaging.
        quiz explanations: provide clear rationale for correct answers.
        interactive activity instructions: make them informative and helpful.
        resources: optionally expand or add more, if needed.
    
    Only output valid JSON (no extra commentary). Do not include the backtics or specify that the content is json.
    Ensure the final course is robust, professional, and edifying.`;
}

    const prompt = `
The title of the course is: "${title}". Generate the course around this: "${description}"
    `;

    const response = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo',
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10000,
    });

    const generatedContent = response.choices[0]?.message?.content || '';
    if(!generatedContent || generatedContent === '') {
      return NextResponse.json({ error: 'Failed to generate course.' }, { status: 500 });
    }
    console.log('Generated course from route:', generatedContent);

    const response2 = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo',
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: secondPrompt(response.choices[0]?.message?.content || '') },
        // { role: 'user', content: prompt },
      ],
      max_tokens: 10000,
    });

    const generatedContent2 = response2.choices[0]?.message?.content || '';
    console.log('Generated ACTUAL CONTENT:', generatedContent2);
    let course = JSON.parse(generatedContent2);
    const courseId = course.id || `course-${Date.now()}`;

    // Replace image srcs using Google Image Search API
    course = await replaceImageSrcs(course);

    // Save to Firebase Firestore
    const courseRef = doc(collection(db, 'courses'), courseId);
    await setDoc(courseRef, { ...course, id: courseId });

    return NextResponse.json({ course, courseId });
  } catch (error) {
    console.error('Error generating course:', error);
    return NextResponse.json({ error: 'Failed to generate course.' }, { status: 500 });
  }
}