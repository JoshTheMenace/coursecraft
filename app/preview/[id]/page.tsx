import { get } from 'http';
import CourseHomeClient from './CourseHomeClient';

export async function getCourseData(id: string) {
  return {
    "id": "html-beginners-course",
    "title": "HTML for Beginners",
    "description": "A simple course defining the basics of HTML, explaining key concepts, and helping the user to begin their journey.",
    "modules": [
      {
        "id": "module1",
        "title": "Introduction to HTML",
        "description": "Learn what HTML is, its importance, and how to set up your environment to begin coding.",
        "lessons": [
          {
            "id": "lesson1",
            "title": "What is HTML?",
            "content": [
              {
                "type": "text",
                "data": "HTML stands for HyperText Markup Language. It is the standard language for creating web pages and web applications. By structuring content with HTML, you can display text, images, links, and more in a browser."
              },
              {
                "type": "image",
                "src": "https://example.com/html-overview.png",
                "alt": "HTML structure overview"
              },
              {
                "type": "text",
                "data": "Every website you visit relies on HTML to organize its content. It acts as the backbone for other technologies like CSS (for styling) and JavaScript (for interactivity)."
              }
            ]
          },
          {
            "id": "lesson2",
            "title": "Setting Up Your Environment",
            "content": [
              {
                "type": "text",
                "data": "Before you can start coding in HTML, you need a text editor and a web browser. Popular editors include Visual Studio Code, Sublime Text, and Notepad++. Any modern browser like Chrome, Firefox, or Edge will display HTML pages."
              },
              {
                "type": "text",
                "data": "To begin, install a text editor of your choice. Open it and create a new file with a .html extension. This file will serve as your HTML document."
              },
              {
                "type": "image",
                "src": "https://example.com/editor-setup.png",
                "alt": "Setting up a text editor for HTML"
              }
            ]
          }
        ],
        "quiz": {
          "id": "quiz1",
          "questions": [
            {
              "id": "question1",
              "prompt": "What does HTML stand for?",
              "options": ["HyperText Markup Language", "Hyperlink Markup Language", "Home Tool Markup Language", "HyperText Machine Language"],
              "correctIndex": 0
            }
          ]
        }
      },
      {
        "id": "module2",
        "title": "Basic HTML Elements",
        "description": "Discover the foundational building blocks of HTML, including headings, paragraphs, and links.",
        "lessons": [
          {
            "id": "lesson1",
            "title": "Headings and Paragraphs",
            "content": [
              {
                "type": "text",
                "data": "HTML uses tags to create headings and paragraphs. Headings are defined by <h1> to <h6> tags, with <h1> being the largest and most important."
              },
              {
                "type": "text",
                "data": "Paragraphs are defined by the <p> tag. They help structure your content into readable blocks."
              },
              {
                "type": "image",
                "src": "https://example.com/headings-paragraphs.png",
                "alt": "Examples of HTML headings and paragraphs"
              }
            ]
          },
          {
            "id": "lesson2",
            "title": "Creating Links",
            "content": [
              {
                "type": "text",
                "data": "Links are created using the <a> tag. The 'href' attribute specifies the destination URL. For example, <a href='https://example.com'>Visit Example</a> creates a clickable link."
              },
              {
                "type": "text",
                "data": "Links are essential for navigating between web pages and resources. You can also link to files, images, or specific sections within a page."
              },
              {
                "type": "image",
                "src": "https://example.com/links.png",
                "alt": "HTML link example"
              }
            ]
          }
        ],
        "quiz": {
          "id": "quiz2",
          "questions": [
            {
              "id": "question1",
              "prompt": "Which tag is used for creating a hyperlink?",
              "options": ["<a>", "<link>", "<href>", "<url>"],
              "correctIndex": 0
            }
          ]
        },
        "interactiveActivities": [
          {
            "id": "activity1",
            "type": "matching",
            "instructions": "Match the HTML tags with their purposes.",
            "pairs": [
              { "value": "<h1>", "pair": "Main Heading" },
              { "value": "<p>", "pair": "Paragraph" },
              { "value": "<a>", "pair": "Hyperlink" }
            ]
          }
        ]
      },
      {
        "id": "module3",
        "title": "Building a Basic Web Page",
        "description": "Combine your knowledge to create a functional HTML document with headings, paragraphs, links, and images.",
        "lessons": [
          {
            "id": "lesson1",
            "title": "Structuring Your Page",
            "content": [
              {
                "type": "text",
                "data": "A well-structured HTML page begins with a <html> tag and contains a <head> and <body>. The <head> section includes metadata, while the <body> contains the visible content."
              },
              {
                "type": "image",
                "src": "https://example.com/html-page-structure.png",
                "alt": "HTML page structure"
              }
            ]
          },
          {
            "id": "lesson2",
            "title": "Adding Images",
            "content": [
              {
                "type": "text",
                "data": "Images are added using the <img> tag. It requires a 'src' attribute for the image URL and an 'alt' attribute for alternative text."
              },
              {
                "type": "text",
                "data": "For example, <img src='image.jpg' alt='An example image'> displays an image and provides a description if the image fails to load."
              },
              {
                "type": "image",
                "src": "https://example.com/image-tag.png",
                "alt": "HTML image example"
              }
            ]
          }
        ]
      }
    ],
    "theme": {
      "primaryColor": "#1E90FF",
      "secondaryColor": "#FFFFFF",
      "fontFamily": "Arial, sans-serif"
    }
  };
}

export default async function CourseHome({
  params: unresolvedParams,
}: {
  params: { id: string };
}) {
  // Explicitly resolve `params`
  const params = await Promise.resolve(unresolvedParams);

  // Extract `id`
  const { id } = params;

  // Fetch course data
  const { theme, modules, description, title } = await getCourseData(id);

  // Return JSX for the page
  return (
    <CourseHomeClient
      course={{ modules, description, title }}
      theme={theme}
      id={id}
    />
  );
}


