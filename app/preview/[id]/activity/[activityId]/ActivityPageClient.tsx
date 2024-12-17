// app/preview/[id]/activity/[activityId]/ActivityPageClient.tsx
'use client'

import { useCourse } from '../../CourseContextProvider';
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { ArrowsUpDownIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, PencilSquareIcon, CheckCircleIcon as SaveIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { db } from '../../../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface MatchingPair {
  element: string
  purpose: string
}

interface Activity {
  id: string;
  type: string;
  instructions: string;
  pairs: MatchingPair[];
  title?: string;
  description?: string;
}

export default function ActivityPageClient({ params }: { params: {id:string, activityId:string} }) {
  const courseData = useCourse();
  if (!courseData) return <div>No course data</div>;

  const { id, activityId } = params;
  const [moduleId, activityIdPart] = activityId.split('~');

  const foundModuleIndex = courseData.modules.findIndex((m: any) => m.id === moduleId);
  const foundModule = courseData.modules[foundModuleIndex];
  if (!foundModule || !foundModule.interactiveActivities) return <div>No activity in this module</div>;

  const foundActivityIndex = foundModule.interactiveActivities.findIndex((act: any) => act.id === activityIdPart);
  const foundActivity = foundModule.interactiveActivities[foundActivityIndex];
  if (!foundActivity) return <div>Activity not found</div>;

  const initialActivity: Activity = {
    ...foundActivity,
    pairs: foundActivity.pairs.map((pair: any) => ({
      element: pair.value,
      purpose: pair.pair,
    }))
  }

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialActivity.title || '');
  const [description, setDescription] = useState(initialActivity.description || '');
  const [instructions, setInstructions] = useState(initialActivity.instructions || '');
  const [pairs, setPairs] = useState<MatchingPair[]>(initialActivity.pairs);
  const [activityType, setActivityType] = useState(initialActivity.type || 'matching');

  useEffect(() => {
    setTitle(initialActivity.title || '');
    setDescription(initialActivity.description || '');
    setInstructions(initialActivity.instructions || '');
    setPairs(initialActivity.pairs);
    setActivityType(initialActivity.type || 'matching');
  }, [initialActivity]);

  const handlePairChange = (index: number, field: 'element' | 'purpose', value: string) => {
    setPairs(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  }

  const addPair = () => {
    setPairs(prev => [...prev, { element: '', purpose: '' }]);
  }

  const removePair = (index: number) => {
    setPairs(prev => prev.filter((_, i) => i !== index));
  }

  const handleSave = async () => {
    // Convert pairs back to {value, pair} structure
    const updatedPairs = pairs.map(p => ({ value: p.element, pair: p.purpose }));

    const updatedCourseData = { ...courseData };
    updatedCourseData.modules[foundModuleIndex].interactiveActivities[foundActivityIndex] = {
      ...foundActivity,
      title: title || undefined,
      description: description || undefined,
      instructions: instructions,
      type: activityType,
      pairs: updatedPairs
    };

    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, updatedCourseData);
    setIsEditing(false);
  }

  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='%23ffffff'/><path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/></svg>`;

  return (
    <main className="min-h-screen p-8" style={{
      fontFamily:'var(--font-family)',
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url("${patternDataUrl}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '40px 40px',
    }}>
      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{type:'spring',stiffness:80,damping:20}}
        className="max-w-4xl mx-auto"
      >
        {isEditing ? (
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <input 
                type="text" 
                className="border rounded p-2 w-full mr-4" 
                value={title} 
                onChange={(e)=>setTitle(e.target.value)} 
                placeholder="Activity Title"
              />
              <button 
                onClick={handleSave} 
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <SaveIcon className="h-5 w-5"/>
                Save
              </button>
              <button 
                onClick={()=>setIsEditing(false)} 
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2 ml-2"
              >
                <XMarkIcon className="h-5 w-5"/>
                Cancel
              </button>
            </div>
            <textarea
              className="border rounded p-2 w-full h-20"
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              placeholder="Activity Description"
            />

            <textarea
              className="border rounded p-2 w-full h-20"
              value={instructions}
              onChange={(e)=>setInstructions(e.target.value)}
              placeholder="Instructions"
            />

            <label className="font-semibold">Activity Type:</label>
            <select 
              className="border rounded p-2 w-full"
              value={activityType}
              onChange={(e)=>setActivityType(e.target.value)}
            >
              <option value="matching">Matching</option>
              <option value="drag-and-drop">Drag & Drop</option>
              <option value="flashcards">Flashcards</option>
            </select>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Pairs</h3>
              {pairs.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    placeholder="Element (value)"
                    value={p.element}
                    onChange={(e)=>handlePairChange(i, 'element', e.target.value)}
                  />
                  <input
                    type="text"
                    className="border rounded p-2 flex-1"
                    placeholder="Purpose (pair)"
                    value={p.purpose}
                    onChange={(e)=>handlePairChange(i, 'purpose', e.target.value)}
                  />
                  <button 
                    onClick={()=>removePair(i)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                onClick={addPair}
                className="px-4 py-2 mt-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Add Pair
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-extrabold mb-1" style={{color:'var(--color-primary)'}}>
                {title || 'Interactive Activity'}
              </h1>
              <p className="text-gray-800 mb-1 whitespace-pre-line">{description || 'Complete the activity below:'}</p>
            </div>
            <button 
              onClick={()=>setIsEditing(true)}
              className="inline-block px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2"
            >
              <PencilSquareIcon className="h-5 w-5"/>
              Edit
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="mb-8 p-6 bg-gray-50 rounded shadow">
            <h2 className="text-xl font-semibold mb-2" style={{color:'var(--color-primary)'}}>Instructions</h2>
            <p className="text-gray-700 mb-6">{instructions}</p>
            
            {activityType === 'matching' && <MatchingGame pairs={pairs} />}
            {activityType === 'drag-and-drop' && <DragAndDropGame pairs={pairs} />}
            {activityType === 'flashcards' && <FlashcardsGame pairs={pairs} />}
          </div>
        )}

        <div className="text-right">
          <Link 
            href={`/preview/${id}`} 
            className="inline-block px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Return to Course Home
          </Link>
        </div>
      </motion.div>
    </main>
  )
}


/** BELOW REMAINS THE SAME GAMES IMPLEMENTATION **/

function MatchingGame({ pairs }: { pairs: MatchingPair[] }) {
  const shuffledPurposes = React.useMemo(() => [...pairs.map(p=>p.purpose)].sort(()=>0.5 - Math.random()), [pairs]);
  const [answers, setAnswers] = useState<string[]>(Array(pairs.length).fill(''));
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (idx:number, val:string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = val;
    setAnswers(newAnswers);
  }

  const checkAnswers = () => {
    setSubmitted(true);
  }

  const correctCount = answers.filter((ans,i)=>ans === pairs[i].purpose).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Elements */}
        <div className="flex flex-col gap-4">
          {pairs.map((p,i)=>(
            <div key={i} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <span className="font-semibold text-gray-900">{p.element}</span>
              {submitted && answers[i] === p.purpose && (
                <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
              )}
              {submitted && answers[i] !== p.purpose && (
                <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
              )}
            </div>
          ))}
        </div>
        
        {/* Right column: Dropdowns */}
        <div className="flex flex-col gap-4">
          {pairs.map((p,i)=>(
            <div key={i} className="bg-white p-4 rounded shadow flex items-center">
              <select
                className="flex-1 border border-gray-300 rounded p-2"
                value={answers[i]}
                onChange={(e)=>handleChange(i,e.target.value)}
                disabled={submitted}
              >
                <option value="">Select a match...</option>
                {shuffledPurposes.map((purp,j)=>(
                  <option key={j} value={purp}>{purp}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {!submitted && (
        <button
          className="mt-4 self-start px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={checkAnswers}
        >
          Check Answers
        </button>
      )}

      {submitted && (
        <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded">
          <p className="text-green-800 font-semibold">You got {correctCount} out of {pairs.length} correct!</p>
        </div>
      )}
    </div>
  );
}


function DragAndDropGame({ pairs }: { pairs: MatchingPair[] }) {
  const shuffledPairs = React.useMemo(() => {
    return [...pairs].sort(()=>0.5 - Math.random());
  }, [pairs]);

  const elements = shuffledPairs.map(p=>p.element);
  const purposes = shuffledPairs.map(p=>p.purpose);
  
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [userMatches, setUserMatches] = useState<Record<string,string>>({});
  const [submitted, setSubmitted] = useState(false);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, elem: string) => {
    e.dataTransfer.setData('text/plain', elem);
    setDragItem(elem);
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>, purpose: string) => {
    e.preventDefault();
    const elem = e.dataTransfer.getData('text/plain');
    setUserMatches(old=>({
      ...old,
      [purpose]: elem
    }));
    setDragItem(null);
  }

  const checkAnswers = () => {
    setSubmitted(true);
  }

  const correctCount = purposes.filter(p => {
    const matchedElem = userMatches[p];
    const actualPair = pairs.find(pair=>pair.purpose===p);
    return matchedElem && actualPair && matchedElem === actualPair.element;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Draggable elements */}
        <div className="bg-white p-4 rounded shadow flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2" style={{color:'var(--color-primary)'}}>Elements</h3>
          {elements.map((elem,i)=>(
            <div
              key={i}
              draggable={!submitted}
              onDragStart={(e)=>onDragStart(e, elem)}
              className={`p-3 rounded border hover:bg-gray-100 cursor-move ${
                dragItem===elem ? 'opacity-50' : ''
              }`}
              style={{borderColor:'var(--color-primary)'}}
            >
              {elem}
            </div>
          ))}
        </div>

        {/* Drop targets */}
        <div className="bg-white p-4 rounded shadow flex flex-col gap-4">
          <h3 className="text-lg font-semibold mb-2" style={{color:'var(--color-primary)'}}>Purposes</h3>
          {purposes.map((purp,i)=>(
            <div
              key={i}
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e,purp)}
              className="p-3 rounded border border-dashed border-gray-300 min-h-[50px] flex items-center justify-between"
            >
              <span className="font-medium text-gray-700">{purp}</span>
              {userMatches[purp] && (
                <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {userMatches[purp]}
                </span>
              )}
              {submitted && (
                pairs.find(pair=>pair.purpose===purp)?.element === userMatches[purp] ?
                  <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" /> :
                  <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {!submitted && (
        <button
          className="self-start px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={checkAnswers}
        >
          Check Answers
        </button>
      )}

      {submitted && (
        <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded">
          <p className="text-green-800 font-semibold">You matched {correctCount} out of {pairs.length} correctly!</p>
        </div>
      )}
    </div>
  );
}


function FlashcardsGame({ pairs }: { pairs: MatchingPair[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = pairs[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((idx) => (idx+1 < pairs.length ? idx+1 : idx));
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((idx) => (idx-1 >= 0 ? idx-1 : 0));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        className={`relative w-64 h-40 rounded shadow-xl border flex items-center justify-center text-xl font-semibold transition-transform transform-gpu cursor-pointer bg-white ${
          flipped ? 'rotate-y-180' : ''
        }`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          color:'var(--color-primary)'
        }}
        onClick={()=>setFlipped(!flipped)}
      >
        {/* Front Side */}
        <div 
          className="absolute w-full h-full flex items-center justify-center p-4 backface-hidden"
          style={{backfaceVisibility:'hidden'}}
        >
          {currentCard.element}
        </div>
        {/* Back Side */}
        <div 
          className="absolute w-full h-full flex items-center justify-center p-4 bg-gray-100 rotate-y-180 backface-hidden"
          style={{backfaceVisibility:'hidden'}}
        >
          {currentCard.purpose}
        </div>
      </div>
      <p className="text-gray-600 text-sm">Click the card to flip!</p>
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={prevCard}
          disabled={currentIndex===0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={nextCard}
          disabled={currentIndex===pairs.length-1}
        >
          Next
        </button>
      </div>
      <p className="text-gray-700">Card {currentIndex+1} of {pairs.length}</p>
    </div>
  );
}
