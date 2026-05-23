// server/controller/progress/progresscontroller.js
const Progress = require('../../models/progress');

exports.getProgress = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: 'Email required' });

    let progress = await Progress.findOne({ email });
    
    if (!progress) {
      // Return default progress structure
      return res.json({ 
        email, 
        completedLessons: [], 
        scores: {},
        username: "",
        college: "",
        year: ""
      });
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { email, lessonId, score } = req.body;
    
    if (!email || !lessonId) {
      return res.status(400).json({ message: 'Email and lessonId required' });
    }

    let progress = await Progress.findOne({ email });
    
    if (!progress) {
      // Create new progress document
      progress = new Progress({
        email,
        completedLessons: [lessonId],
        scores: { [lessonId]: score || 100 }
      });
    } else {
      // Add lesson if not already completed
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      // Update score
      if (score) {
        progress.scores.set(lessonId, score);
      }
    }
    
    await progress.save();
    res.json({ success: true, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};