import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export const runtime = 'nodejs' // Ensure Node.js environment

export async function POST(request: NextRequest) {
  try {
    const { course } = await request.json();

    // Your large static code can be here as strings or loaded from files
    const mainDartCode = `
import 'package:flutter/material.dart';
import 'models.dart';
import 'data_parser.dart';
import 'pages/course_home_page.dart';
import 'package:flutter/services.dart' show rootBundle; // For loading assets


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final String courseJson = await rootBundle.loadString('assets/data/GEN_JSON.json');

  final course = await parseCourse(courseJson);
  runApp(MyApp(course: course));
}

class MyApp extends StatelessWidget {
  final Course course;
  const MyApp({Key? key, required this.course}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: course.title,
      theme: ThemeData(
        primaryColor: course.theme.primaryColor,
        colorScheme: ColorScheme.fromSeed(seedColor: course.theme.primaryColor),
        fontFamily: course.theme.fontFamily,
      ),
      home: CourseHomePage(course: course),
    );
  }
}
`;

    const courseHomePageDartCode = `
import 'package:flutter/material.dart';
import '../../models.dart';
import 'module_detail_page.dart';

class CourseHomePage extends StatelessWidget {
  final Course course;
  const CourseHomePage({Key? key, required this.course}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(course.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE3FDFD), Color(0xFFFEFCF3)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            children: [
              // Course Intro Card
              Material(
                elevation: 5,
                borderRadius: BorderRadius.circular(16),
                color: Colors.white,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        course.title,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.primaryColorDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        course.description,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontSize: 16,
                          color: Colors.grey[800],
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                "Modules",
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.primaryColorDark,
                ),
              ),
              const SizedBox(height: 16),

              ...course.modules.map((mod) {
                return GestureDetector(
                  onTap: () {
                    Navigator.push(context,
                        PageRouteBuilder(
                          transitionDuration: const Duration(milliseconds: 500),
                          pageBuilder: (context, animation, secondaryAnimation) {
                            return FadeTransition(
                              opacity: animation,
                              child: ModuleDetailPage(module: mod),
                            );
                          },
                        )
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 10),
                    child: Material(
                      elevation: 3,
                      borderRadius: BorderRadius.circular(16),
                      color: Colors.white,
                      child: ListTile(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        leading: CircleAvatar(
                          backgroundColor: theme.primaryColorLight,
                          child: Icon(Icons.book, color: theme.primaryColorDark),
                        ),
                        title: Text(
                          mod.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        subtitle: Text(
                          mod.description,
                          style: TextStyle(color: Colors.grey[700]),
                        ),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 18),
                        contentPadding: const EdgeInsets.all(16),
                      ),
                    ),
                  ),
                );
              }).toList()
            ],
          ),
        ),
      ),
    );
  }
}
`;

    const interactiveActivityPageDartCode = `import 'package:flutter/material.dart';
import '../../models.dart';

class InteractiveActivityPage extends StatefulWidget {
  final InteractiveActivity activity;
  const InteractiveActivityPage({Key? key, required this.activity}) : super(key: key);

  @override
  State<InteractiveActivityPage> createState() => _InteractiveActivityPageState();
}

class _InteractiveActivityPageState extends State<InteractiveActivityPage> {
  late List<MatchingPair> pairs;
  Map<String, String?> userMatches = {};

  @override
  void initState() {
    super.initState();
    pairs = widget.activity.pairs;
    for (var p in pairs) {
      userMatches[p.value] = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final leftItems = pairs.map((p) => p.value).toList();
    final rightItems = pairs.map((p) => p.pair).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Activity"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(widget.activity.instructions, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: ListView(
                      children: leftItems.map((item) {
                        return Draggable<String>(
                          data: item,
                          feedback: Material(
                            color: Colors.blueAccent.withOpacity(0.7),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            child: Padding(
                              padding: const EdgeInsets.all(8),
                              child: Text(item, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.black12),
                              borderRadius: BorderRadius.circular(8),
                              color: Colors.white,
                            ),
                            child: Text(item),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(width: 40),
                  Expanded(
                    child: ListView(
                      children: rightItems.map((pairText) {
                        return DragTarget<String>(
                          builder: (context, candidateData, rejectedData) {
                            String? matchedKey;
                            userMatches.forEach((key, val) {
                              if (val == pairText) matchedKey = key;
                            });
                            return Container(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: candidateData.isNotEmpty ? Colors.green : Colors.black12),
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.grey[100],
                              ),
                              child: Text(matchedKey ?? pairText, 
                                style: TextStyle(fontWeight: matchedKey != null ? FontWeight.bold : FontWeight.normal)),
                            );
                          },
                          onWillAccept: (data) {
                            // Only accept if not matched yet
                            return !userMatches.values.contains(pairText);
                          },
                          onAccept: (data) {
                            setState(() {
                              userMatches[data] = pairText;
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {
                bool allCorrect = true;
                for (var p in pairs) {
                  if (userMatches[p.value] != p.pair) {
                    allCorrect = false;
                    break;
                  }
                }
                showDialog(
                    context: context,
                    builder: (context) {
                      return AlertDialog(
                        title: const Text("Results"),
                        content: Text(allCorrect ? "All matches are correct! Great job." : "Some matches are incorrect. Try again."),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("OK"),
                          )
                        ],
                      );
                    });
              },
              child: const Text("Check Answers"),
            )
          ],
        ),
      ),
    );
  }
}
`;

    const lessonDetailPageDartCode = `
import 'package:flutter/material.dart';
import '../../models.dart';

class LessonDetailPage extends StatelessWidget {
  final Lesson lesson;
  const LessonDetailPage({Key? key, required this.lesson}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(lesson.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFf9f9f9), Color(0xFFeaeaea)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: lesson.content.length,
            itemBuilder: (context, index) {
              final c = lesson.content[index];
              if (c.type == "text") {
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 8.0),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    c.data ?? "",
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontSize: 16,
                      height: 1.5,
                      color: Colors.grey[800],
                    ),
                  ),
                );
              } else if (c.type == "image") {
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 12.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      c.src ?? "",
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) {
                          return child;
                        }
                        return Center(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(
                              value: loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded / (loadingProgress.expectedTotalBytes ?? 1)
                                  : null,
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stack) => Container(
                        padding: const EdgeInsets.all(16),
                        color: Colors.white,
                        child: const Text(
                          "Image failed to load",
                          style: TextStyle(color: Colors.redAccent),
                        ),
                      ),
                    ),
                  ),
                );
              } else {
                return const SizedBox.shrink();
              }
            },
          ),
        ),
      ),
    );
  }
}
`;

    const moduleDetailPageDartCode = `
import 'package:flutter/material.dart';
import '../../models.dart';
import 'lesson_detail_page.dart';
import 'quiz_page.dart';
import 'interactive_activity_page.dart';

class ModuleDetailPage extends StatelessWidget {
  final Module module;
  const ModuleDetailPage({Key? key, required this.module}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(module.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF0F9FF), Color(0xFFE0F7FA)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Hero(
                tag: module.id,
                child: Material(
                  color: Colors.transparent,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Text(
                      module.description,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[800],
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                "Lessons",
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.primaryColorDark,
                ),
              ),
              const SizedBox(height: 12),
              ...module.lessons.map((lesson) {
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: Material(
                    elevation: 3,
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.white,
                    child: ListTile(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(
                          builder: (context) => LessonDetailPage(lesson: lesson),
                        ));
                      },
                      title: Text(
                        lesson.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 18),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                );
              }).toList(),
              const SizedBox(height: 24),

              if (module.quiz != null) ...[
                Text(
                  "Quiz",
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColorDark,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (context) => QuizPage(quiz: module.quiz!),
                    ));
                  },
                  icon: const Icon(Icons.quiz, size: 20),
                  label: const Text("Take Quiz", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 24),
              ],

              if (module.interactiveActivities.isNotEmpty) ...[
                Text(
                  "Interactive Activities",
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.primaryColorDark,
                  ),
                ),
                const SizedBox(height: 12),
                ...module.interactiveActivities.map((activity) => Container(
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20), backgroundColor: Colors.deepPurpleAccent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (context) => InteractiveActivityPage(activity: activity),
                      ));
                    },
                    icon: const Icon(Icons.extension, size: 20),
                    label: const Text("Start Activity", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ))
              ],
            ],
          ),
        ),
      ),
    );
  }
}
`;

    const quizPageDartCode = `
import 'package:flutter/material.dart';
import '../../models.dart';

class QuizPage extends StatefulWidget {
  final Quiz quiz;
  const QuizPage({Key? key, required this.quiz}) : super(key: key);

  @override
  State<QuizPage> createState() => _QuizPageState();
}

class _QuizPageState extends State<QuizPage> {
  int currentQuestionIndex = 0;
  int? selectedOptionIndex;
  bool showResult = false;
  bool answeredCorrectly = false;

  @override
  Widget build(BuildContext context) {
    final question = widget.quiz.questions[currentQuestionIndex];
    return Scaffold(
      appBar: AppBar(
        title: const Text("Quiz"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: showResult
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      answeredCorrectly ? "Correct!" : "Incorrect",
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text("Done"),
                    )
                  ],
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(question.prompt, style: const TextStyle(fontSize: 18)),
                  const SizedBox(height: 16),
                  ...List.generate(question.options.length, (i) {
                    return RadioListTile<int>(
                      title: Text(question.options[i]),
                      value: i,
                      groupValue: selectedOptionIndex,
                      onChanged: (val) {
                        setState(() {
                          selectedOptionIndex = val;
                        });
                      },
                    );
                  }),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (selectedOptionIndex == null) return;
                      setState(() {
                        answeredCorrectly = (selectedOptionIndex == question.correctIndex);
                        showResult = true;
                      });
                    },
                    child: const Text("Submit"),
                  )
                ],
              ),
      ),
    );
  }
}
`;

    const dataParserDartCode = `
import 'dart:convert';
import 'package:flutter/material.dart';
import 'models.dart';

Future<Course> parseCourse(String jsonStr) async {
  final data = json.decode(jsonStr);

  Color _colorFromHex(String hex) {
    final buffer = StringBuffer();
    if (hex.length == 6 || hex.length == 7) buffer.write('ff');
    buffer.write(hex.replaceFirst('#', ''));
    try {
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (e) {
      print('Error parsing color: $hex');
      return Colors.black;
    }
  }

  final themeData = data["theme"];
  final theme = CourseTheme(
    primaryColor: _colorFromHex(themeData["primaryColor"]),
    secondaryColor: _colorFromHex(themeData["secondaryColor"]),
    fontFamily: themeData["fontFamily"],
  );

  List<Module> modules = (data["modules"] as List).map((m) {
    List<Lesson> lessons = (m["lessons"] as List? ?? []).map((l) {
      List<LessonContent> contents = (l["content"] as List? ?? []).map((c) {
        return LessonContent(
          type: c["type"],
          data: c["data"],
          src: c["src"],
          alt: c["alt"],
        );
      }).toList();
      return Lesson(
        id: l["id"],
        title: l["title"],
        content: contents,
      );
    }).toList();

    Quiz? quiz;
    if (m["quiz"] != null) {
      List<Question> qs = (m["quiz"]["questions"] as List).map((q) {
        return Question(
          id: q["id"],
          prompt: q["prompt"],
          options: (q["options"] as List).map((o) => o as String).toList(),
          correctIndex: q["correctIndex"],
        );
      }).toList();
      quiz = Quiz(id: m["quiz"]["id"], questions: qs);
    }

    List<InteractiveActivity> activities = [];
    if (m["interactiveActivities"] != null) {
      activities = (m["interactiveActivities"] as List).map((a) {
        List<MatchingPair> pairs = (a["pairs"] as List).map((p) {
          return MatchingPair(value: p["value"], pair: p["pair"]);
        }).toList();
        return InteractiveActivity(
          id: a["id"],
          type: a["type"],
          instructions: a["instructions"],
          pairs: pairs,
        );
      }).toList();
    }

    return Module(
      id: m["id"],
      title: m["title"],
      description: m["description"],
      lessons: lessons,
      quiz: quiz,
      interactiveActivities: activities,
    );
  }).toList();

  return Course(
    id: data["id"],
    title: data["title"],
    description: data["description"],
    modules: modules,
    theme: theme,
  );
}
`;

    const modelsDartCode = `
import 'package:flutter/material.dart';

class Course {
  final String id;
  final String title;
  final String description;
  final List<Module> modules;
  final CourseTheme theme;
  Course({
    required this.id,
    required this.title,
    required this.description,
    required this.modules,
    required this.theme,
  });
}

class CourseTheme {
  final Color primaryColor;
  final Color secondaryColor;
  final String fontFamily;
  CourseTheme({
    required this.primaryColor,
    required this.secondaryColor,
    required this.fontFamily,
  });
}

class Module {
  final String id;
  final String title;
  final String description;
  final List<Lesson> lessons;
  final Quiz? quiz;
  final List<InteractiveActivity> interactiveActivities;

  Module({
    required this.id,
    required this.title,
    required this.description,
    required this.lessons,
    required this.quiz,
    required this.interactiveActivities,
  });
}

class Lesson {
  final String id;
  final String title;
  final List<LessonContent> content;

  Lesson({required this.id, required this.title, required this.content});
}

class LessonContent {
  final String type;
  final String? data;
  final String? src;
  final String? alt;

  LessonContent({required this.type, this.data, this.src, this.alt});
}

class Quiz {
  final String id;
  final List<Question> questions;

  Quiz({required this.id, required this.questions});
}

class Question {
  final String id;
  final String prompt;
  final List<String> options;
  final int correctIndex;

  Question({
    required this.id,
    required this.prompt,
    required this.options,
    required this.correctIndex,
  });
}

class InteractiveActivity {
  final String id;
  final String type; // e.g. "matching"
  final String instructions;
  final List<MatchingPair> pairs;

  InteractiveActivity({
    required this.id,
    required this.type,
    required this.instructions,
    required this.pairs,
  });
}

class MatchingPair {
  final String value;
  final String pair;

  MatchingPair({required this.value, required this.pair});
}
`;

const pubspecYaml = `name: coursecraft
description: "A new Flutter project."
# The following line prevents the package from being accidentally published to
publish_to: 'none' # Remove this line if you wish to publish to pub.dev

# The following defines the version and build number for your application.
# A version number is three numbers separated by dots, like 1.2.43
# followed by an optional build number separated by a +.
# Both the version and the builder number may be overridden in flutter
# build by specifying --build-name and --build-number, respectively.
# In Android, build-name is used as versionName while build-number used as versionCode.
# Read more about Android versioning at https://developer.android.com/studio/publish/versioning
# In iOS, build-name is used as CFBundleShortVersionString while build-number is used as CFBundleVersion.
# Read more about iOS versioning at
# https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html
# In Windows, build-name is used as the major, minor, and patch parts
# of the product and file versions while build-number is used as the build suffix.
version: 1.0.0+1

environment:
  sdk: ^3.5.4

# Dependencies specify other packages that your package needs in order to work.
# To automatically upgrade your package dependencies to the latest versions
# dependencies can be manually updated by changing the version numbers below to
# the latest version available on pub.dev. To see which dependencies have newer
dependencies:
  flutter:
    sdk: flutter


  # The following adds the Cupertino Icons font to your application.
  # Use with the CupertinoIcons class for iOS style icons.
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter

  
  flutter_lints: ^4.0.0

# For information on the generic Dart part of this file, see the
# following page: https://dart.dev/tools/pub/pubspec

# The following section is specific to Flutter packages.
flutter:

  # The following line ensures that the Material Icons font is
  # included with your application, so that you can use the icons in
  # the material Icons class.
  uses-material-design: true

  # To add assets to your application, add an assets section, like this:
  assets:
    - assets/data/GEN_JSON.json
  #   - images/a_dot_burr.jpeg
  #   - images/a_dot_ham.jpeg

  # An image asset can refer to one or more resolution-specific "variants", see
  # https://flutter.dev/to/resolution-aware-images

  # For details regarding adding assets from package dependencies, see
  # https://flutter.dev/to/asset-from-package

  # To add custom fonts to your application, add a fonts section here,
  # in this "flutter" section. Each entry in this list should have a
  # "family" key with the font family name, and a "fonts" key with a
  # list giving the asset and other descriptors for the font. For
  # example:
  # fonts:
  #   - family: Schyler
  #     fonts:
  #       - asset: fonts/Schyler-Regular.ttf
  #       - asset: fonts/Schyler-Italic.ttf
  #         style: italic
  #   - family: Trajan Pro
  #     fonts:
  #       - asset: fonts/TrajanPro.ttf
  #       - asset: fonts/TrajanPro_Bold.ttf
  #         weight: 700
  #
  # For details regarding fonts from package dependencies,
  # see https://flutter.dev/to/font-from-package
`;

    // Convert the incoming course data to JSON
    const genJsonContent = JSON.stringify(course, null, 2);

    // Create a PassThrough stream to pipe data from archiver to a Next.js Response
    const passThrough = new PassThrough();

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => { throw err; });

    // Append files
    archive.append(mainDartCode, { name: 'lib/main.dart' });
    archive.append(modelsDartCode, { name: 'lib/models.dart' });
    archive.append(dataParserDartCode, { name: 'lib/data_parser.dart' });
    archive.append(genJsonContent, { name: 'assets/data/GEN_JSON.json' });

    archive.append(courseHomePageDartCode, { name: 'lib/pages/course_home_page.dart' });
    archive.append(interactiveActivityPageDartCode, { name: 'lib/pages/interactive_activity_page.dart' });
    archive.append(lessonDetailPageDartCode, { name: 'lib/pages/lesson_detail_page.dart' });
    archive.append(moduleDetailPageDartCode, { name: 'lib/pages/module_detail_page.dart' });
    archive.append(quizPageDartCode, { name: 'lib/pages/quiz_page.dart' });

    archive.finalize();
    archive.pipe(passThrough);

    // Convert Node.js stream (PassThrough) into a web ReadableStream for the response
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Disposition': 'attachment; filename="flutter_code.zip"',
        'Content-Type': 'application/zip'
      }
    });

  } catch (error: any) {
    console.error('Error generating flutter code zip:', error);
    return new Response(JSON.stringify({error:'Internal Server Error'}), { status:500 });
  }
}
