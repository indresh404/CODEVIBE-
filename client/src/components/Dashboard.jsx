// client/src/components/Dashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEnvelope, FaUniversity, FaGraduationCap, FaChartLine, FaCode, FaPlay } from "react-icons/fa";
import { SiJavascript, SiHtml5, SiMongodb, SiExpress, SiMysql, SiNodedotjs, SiC } from "react-icons/si";
import { FaCss3Alt, FaReact } from "react-icons/fa";
import { useAuth } from "../AuthProvider.jsx";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

// Map course name to the exact route path from main.jsx
const COURSE_ROUTES = {
  "HTML": "/HtmlLesson",
  "CSS": "/CssLesson",
  "JavaScript": "/JsLesson",
  "C": "/CLesson",
  "OOP": "/OopLesson",
  "DSA": "/DsaLesson",
  "DBMS": "/DbmsLesson",
  "MongoDB": "/MongoLesson",
  "Node.js": "/NodeLesson",
  "Express.js": "/ExpressLesson",
  "React.js": "/ReactLesson"
};

// Map course name to lesson prefix for progress calculation
const LESSON_PREFIX = {
  "HTML": "html",
  "CSS": "css",
  "JavaScript": "js",
  "C": "c",
  "OOP": "oop",
  "DSA": "dsa",
  "DBMS": "dbms",
  "MongoDB": "mongo",
  "Node.js": "node",
  "Express.js": "express",
  "React.js": "react"
};

// Lesson counts for each course (from catalog/components)
const COURSE_LESSONS = {
  "HTML": 10,
  "CSS": 14,
  "JavaScript": 29,
  "C": 17,
  "OOP": 14,
  "DSA": 12,
  "DBMS": 12,
  "MongoDB": 8,
  "Node.js": 12,
  "Express.js": 10,
  "React.js": 13
};

// Icon mapping for courses - Soft elegant themed colors
const getCourseIcon = (course) => {
  const icons = {
    "HTML": <SiHtml5 size={24} color="#ff6b8b" />,
    "CSS": <FaCss3Alt size={24} color="#ff8da1" />,
    "JavaScript": <SiJavascript size={24} color="#e05c75" />,
    "C": <SiC size={24} color="#d946ef" />,
    "OOP": <FaCode size={22} color="#a855f7" />,
    "DSA": <FaChartLine size={22} color="#8b5cf6" />,
    "DBMS": <SiMysql size={24} color="#ec4899" />,
    "MongoDB": <SiMongodb size={24} color="#f472b6" />,
    "Node.js": <SiNodedotjs size={24} color="#fb7185" />,
    "Express.js": <SiExpress size={24} color="#fda4af" />,
    "React.js": <FaReact size={24} color="#f43f5e" />
  };
  return icons[course] || <FaCode size={22} color="#ff8da1" />;
};

// Calculate percentage from completed lessons
const calculateProgress = (course, completedLessons) => {
  const totalLessons = COURSE_LESSONS[course] || 15;
  const prefix = LESSON_PREFIX[course];
  if (!prefix) return 0;
  
  // Match prefix and number with optional hyphen (e.g. html-lesson1 or css-lesson-1)
  const lessonPattern = new RegExp(`^${prefix}-lesson-?(\\d+)$`, 'i');
  
  const completedNumbers = new Set();
  completedLessons.forEach(lesson => {
    const match = lesson.match(lessonPattern);
    if (match) {
      completedNumbers.add(parseInt(match[1], 10));
    }
  });
  
  const completedCount = completedNumbers.size;
  return Math.min(100, Math.round((completedCount / totalLessons) * 100));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch real progress data from backend
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const email = user?.email || user?.Email;
        
        const response = await axios.get(`${API_BASE_URL}/api/progress/${email}`, {
          withCredentials: true
        });
        
        console.log("Progress data:", response.data);
        setProgressData(response.data);
      } catch (err) {
        console.error("Error fetching progress:", err);
        // Set empty progress data to show courses
        setProgressData({ completedLessons: [], scores: {} });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const handleViewReport = (course) => {
    const email = user?.email || user?.Email || "";
    navigate(`/report/${email}?course=${course}`);
  };

  const handleContinueCourse = (course) => {
    const route = COURSE_ROUTES[course];
    if (!route) {
      console.error("No route found for course:", course);
      return;
    }
    navigate(route);
  };

  // All available courses
  const allCourses = ["HTML", "CSS", "JavaScript", "C", "OOP", "DSA", "DBMS", "MongoDB", "Node.js", "Express.js", "React.js"];
  
  // Calculate progress for each course based on real completed lessons
  const courseProgress = useMemo(() => {
    const progress = {};
    const completedLessons = progressData?.completedLessons || [];
    
    allCourses.forEach(course => {
      progress[course] = calculateProgress(course, completedLessons);
    });
    return progress;
  }, [progressData, allCourses]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const values = Object.values(courseProgress);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, val) => sum + val, 0);
    return Math.round(total / values.length);
  }, [courseProgress]);

  const completedCourses = useMemo(() => {
    return Object.values(courseProgress).filter(p => p >= 100).length;
  }, [courseProgress]);

  const inProgressCourses = useMemo(() => {
    return Object.values(courseProgress).filter(p => p > 0 && p < 100).length;
  }, [courseProgress]);

  const notStartedCourses = useMemo(() => {
    return Object.values(courseProgress).filter(p => p === 0).length;
  }, [courseProgress]);

  // Get status info
  const getStatusInfo = (progress) => {
    if (progress >= 100) return { text: "Completed", color: "#e05c75", icon: "💖" };
    if (progress >= 70) return { text: "Excellent", color: "#ff758c", icon: "✨" };
    if (progress >= 40) return { text: "On Track", color: "#ff8da1", icon: "🌸" };
    if (progress > 0) return { text: "Just Started", color: "#ffa6c9", icon: "🎀" };
    return { text: "Not Started", color: "#a28996", icon: "🤍" };
  };

  const getProgressGradient = (progress) => {
    if (progress >= 100) return "linear-gradient(90deg, #e05c75, #ff6b8b)";
    if (progress >= 70) return "linear-gradient(90deg, #ff758c, #ff8da1)";
    if (progress >= 40) return "linear-gradient(90deg, #ff8da1, #ffa6c9)";
    return "linear-gradient(90deg, #ffa6c9, #ffd1dc)";
  };

  if (!user) {
    return (
      <div style={styles.notLoggedIn}>
        <div style={styles.notLoggedInCard}>
          <span style={styles.notLoggedInIcon}>⚠️</span>
          <p style={styles.notLoggedInText}>Please log in or sign up first!</p>
          <button onClick={() => navigate("/login")} style={styles.loginRedirectBtn}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>✨ CodeVibe Dashboard</span>
        </div>
      </div>

      <div style={styles.mainContent}>
        
        {/* Profile Card & Analytics */}
        <div style={styles.dashboardGrid}>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.profileHeader}>
              <div style={styles.avatarFallback}>
                <FaUserCircle size={64} color="#e05c75" />
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.profileName}>{user.username}</h2>
                <div style={styles.profileBadge}>Student</div>
              </div>
            </div>
            
            <div style={styles.profileDetails}>
              <div style={styles.detailItem}>
                <FaEnvelope style={styles.detailIcon} />
                <span style={styles.detailText}>{user.email || user.Email}</span>
              </div>
              <div style={styles.detailItem}>
                <FaUniversity style={styles.detailIcon} />
                <span style={styles.detailText}>{user.college}</span>
              </div>
              <div style={styles.detailItem}>
                <FaGraduationCap style={styles.detailIcon} />
                <span style={styles.detailText}>Year {user.year}</span>
              </div>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{completedCourses}</div>
                <div style={styles.statLabel}>Completed</div>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <div style={styles.statValue}>{inProgressCourses}</div>
                <div style={styles.statLabel}>In Progress</div>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <div style={styles.statValue}>{notStartedCourses}</div>
                <div style={styles.statLabel}>Not Started</div>
              </div>
            </div>
          </div>

          {/* Circular Progress */}
          <div style={styles.circularCard}>
            <div style={styles.circularContainer}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="62" fill="none" stroke="rgba(244,63,94,0.05)" strokeWidth="10" />
                <circle
                  cx="75"
                  cy="75"
                  r="62"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 62 * (overallProgress / 100)} ${2 * Math.PI * 62}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  style={{ transition: "stroke-dasharray 0.8s ease-out" }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e05c75" />
                    <stop offset="50%" stopColor="#ff758c" />
                    <stop offset="100%" stopColor="#ffa6c9" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={styles.circularText}>
                <span style={styles.circularPercent}>{overallProgress}%</span>
                <span style={styles.circularLabel}>Overall</span>
              </div>
            </div>
            <div style={styles.circularInfo}>
              <h4 style={styles.analyticsTitle}>Learning Progress</h4>
              <p style={styles.analyticsDesc}>
                {overallProgress >= 80 
                  ? "Incredible work! You are making amazing progress! 💖" 
                  : overallProgress >= 50 
                  ? "Great progress. Keep pushing, you're doing great! 🌸"
                  : overallProgress > 0
                  ? "Lovely start! Stay consistent and build your skills! ✨"
                  : "Welcome! Choose a course below to get started! 🎀"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={styles.quickStatsGrid}>
          <div style={styles.quickStatCard}>
            <span style={styles.quickStatIcon}>📚</span>
            <div>
              <div style={styles.quickStatValue}>{allCourses.length}</div>
              <div style={styles.quickStatLabel}>Total Courses</div>
            </div>
          </div>
          <div style={styles.quickStatCard}>
            <span style={styles.quickStatIcon}>💝</span>
            <div>
              <div style={styles.quickStatValue}>{completedCourses}</div>
              <div style={styles.quickStatLabel}>Completed</div>
            </div>
          </div>
          <div style={styles.quickStatCard}>
            <span style={styles.quickStatIcon}>🌸</span>
            <div>
              <div style={styles.quickStatValue}>{inProgressCourses}</div>
              <div style={styles.quickStatLabel}>In Progress</div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div style={styles.coursesSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📖 Your Syllabus</h3>
            <span style={styles.sectionBadge}>{allCourses.length} Enrolled</span>
          </div>
          
          <div style={styles.coursesList}>
            {allCourses.map((course) => {
              const progress = courseProgress[course] || 0;
              const status = getStatusInfo(progress);
              const progressGradient = getProgressGradient(progress);
              const isHovered = hoveredCard === course;
              
              return (
                <div 
                  key={course} 
                  style={{
                    ...styles.courseCard,
                    ...(isHovered ? styles.courseCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredCard(course)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.courseCardLeft}>
                    <div style={styles.courseIconContainer}>
                      {getCourseIcon(course)}
                    </div>
                    <div style={styles.courseInfo}>
                      <div style={styles.courseNameRow}>
                        <span style={styles.courseName}>{course}</span>
                        <span style={{...styles.courseStatus, color: status.color, border: `1px solid ${status.color}25`, background: `${status.color}08`}}>
                          {status.icon} {status.text}
                        </span>
                      </div>
                      
                      <div style={styles.progressBarContainer}>
                        <div style={styles.progressBarWrapper}>
                          <div style={{...styles.progressBarFill, width: `${progress}%`, background: progressGradient}} />
                        </div>
                        <span style={{...styles.progressPercentage, color: progress > 0 ? status.color : "#a28996"}}>{progress}%</span>
                      </div>
                      
                      <div style={styles.courseMeta}>
                        <span style={styles.courseMetaItem}>
                          {progress >= 100 ? "💖 Completed" : progress > 0 ? "⚡ Active" : "⏳ Not Started"}
                        </span>
                        <span style={styles.courseMetaDivider}>•</span>
                        <span style={styles.courseMetaItem}>
                          {COURSE_LESSONS[course]} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={() => handleContinueCourse(course)} 
                      style={{
                        ...styles.continueBtn,
                        ...(progress >= 100 ? styles.completedBtn : {})
                      }}
                    >
                      <FaPlay size={10} style={{ marginRight: "6px" }} />
                      {progress >= 100 ? "Review" : progress > 0 ? "Resume" : "Start"}
                    </button>
                    <button 
                      onClick={() => handleViewReport(course)} 
                      style={styles.viewReportBtn}
                    >
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fff2f5 0%, #ffe4e8 50%, #fecad3 100%)",
    color: "#4a2c3a",
    position: "relative",
    overflowX: "hidden",
    fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff2f5",
  },
  loader: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(244, 63, 94, 0.05)",
    borderTop: "4px solid #ff758c",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#e05c75",
    fontSize: "1rem",
    fontWeight: "500",
  },
  bgBlob1: {
    position: "fixed",
    top: "-10%",
    right: "-10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(244,63,94,0.12) 0%, rgba(244,63,94,0) 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgBlob2: {
    position: "fixed",
    bottom: "-10%",
    left: "-10%",
    width: "550px",
    height: "550px",
    background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0) 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2.5rem",
    background: "rgba(255, 242, 245, 0.8)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(244, 63, 94, 0.12)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #f43f5e, #ec4899, #d946ef)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  mainContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2.5rem 2rem",
    position: "relative",
    zIndex: 1,
  },
  notLoggedIn: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff2f5",
  },
  notLoggedInCard: {
    textAlign: "center",
    padding: "3rem",
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(244, 63, 94, 0.08)",
  },
  notLoggedInIcon: {
    fontSize: "3.5rem",
    display: "block",
    marginBottom: "1.5rem",
  },
  notLoggedInText: {
    color: "#f43f5e",
    fontSize: "1.2rem",
    fontWeight: "500",
    marginBottom: "2rem",
  },
  loginRedirectBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #f43f5e, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(244, 63, 94, 0.25)",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.8rem",
    marginBottom: "1.8rem",
  },
  profileCard: {
    background: "rgba(255, 255, 255, 0.65)",
    borderRadius: "24px",
    padding: "2rem",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 10px 30px rgba(244, 63, 94, 0.04)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
    marginBottom: "1.5rem",
  },
  avatarFallback: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(244, 63, 94, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(244, 63, 94, 0.15)",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#3d1625",
    margin: 0,
  },
  profileBadge: {
    display: "inline-block",
    padding: "2px 10px",
    background: "rgba(244, 63, 94, 0.12)",
    color: "#e11d48",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    marginTop: "4px",
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    padding: "1.2rem 0",
    borderTop: "1px solid rgba(244, 63, 94, 0.1)",
    borderBottom: "1px solid rgba(244, 63, 94, 0.1)",
    marginBottom: "1.5rem",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  detailIcon: {
    color: "#f43f5e",
    fontSize: "1.1rem",
  },
  detailText: {
    color: "#5e3a47",
    fontSize: "0.9rem",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#3d1625",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#7c5c67",
    marginTop: "2px",
  },
  statDivider: {
    width: "1px",
    height: "28px",
    background: "rgba(244, 63, 94, 0.15)",
  },
  circularCard: {
    background: "rgba(255, 255, 255, 0.65)",
    borderRadius: "24px",
    padding: "2rem",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 10px 30px rgba(244, 63, 94, 0.04)",
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  circularContainer: {
    position: "relative",
    width: "150px",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circularText: {
    position: "absolute",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  circularPercent: {
    fontSize: "1.8rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #f43f5e, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: "1",
  },
  circularLabel: {
    fontSize: "0.75rem",
    color: "#7c5c67",
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  circularInfo: {
    flex: 1,
    minWidth: "160px",
  },
  analyticsTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#3d1625",
    marginBottom: "0.6rem",
  },
  analyticsDesc: {
    fontSize: "0.9rem",
    color: "#5e3a47",
    lineHeight: "1.5",
  },
  quickStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.2rem",
    marginBottom: "2.5rem",
  },
  quickStatCard: {
    background: "rgba(255, 255, 255, 0.65)",
    borderRadius: "20px",
    padding: "1.2rem 1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    boxShadow: "0 4px 15px rgba(244, 63, 94, 0.04)",
    transition: "transform 0.3s ease, border-color 0.3s ease",
  },
  quickStatIcon: {
    fontSize: "2rem",
  },
  quickStatValue: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#3d1625",
  },
  quickStatLabel: {
    fontSize: "0.75rem",
    color: "#7c5c67",
  },
  coursesSection: {
    marginTop: "1rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#3d1625",
    letterSpacing: "-0.3px",
  },
  sectionBadge: {
    fontSize: "0.75rem",
    padding: "4px 12px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "20px",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    fontWeight: "600",
  },
  coursesList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  courseCard: {
    background: "rgba(255, 255, 255, 0.65)",
    borderRadius: "20px",
    padding: "1.5rem 1.8rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid rgba(244, 63, 94, 0.12)",
    boxShadow: "0 8px 30px rgba(244, 63, 94, 0.04)",
  },
  courseCardHover: {
    transform: "translateY(-2px)",
    background: "rgba(255, 255, 255, 0.85)",
    borderColor: "rgba(244, 63, 94, 0.4)",
    boxShadow: "0 12px 35px rgba(244, 63, 94, 0.12)",
  },
  courseCardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    flex: 1,
    minWidth: "260px",
  },
  courseIconContainer: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(244, 63, 94, 0.1)",
  },
  courseInfo: {
    flex: 1,
  },
  courseNameRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "0.75rem",
  },
  courseName: {
    fontWeight: "700",
    color: "#3d1625",
    fontSize: "1.1rem",
    letterSpacing: "-0.2px",
  },
  courseStatus: {
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  progressBarContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "0.75rem",
  },
  progressBarWrapper: {
    flex: 1,
    height: "6px",
    background: "rgba(244, 63, 94, 0.08)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  progressPercentage: {
    fontSize: "0.85rem",
    fontWeight: "700",
    minWidth: "36px",
    textAlign: "right",
  },
  courseMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.8rem",
    color: "#7c5c67",
  },
  courseMetaItem: {
    display: "inline-flex",
    alignItems: "center",
  },
  courseMetaDivider: {
    color: "rgba(244, 63, 94, 0.15)",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  continueBtn: {
    padding: "9px 20px",
    background: "linear-gradient(135deg, #f43f5e, #ec4899)",
    color: "#ffffff",
    border: "none",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 15px rgba(244, 63, 94, 0.25)",
  },
  completedBtn: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.4)",
    color: "#059669",
    boxShadow: "none",
  },
  viewReportBtn: {
    padding: "9px 20px",
    background: "rgba(244, 63, 94, 0.04)",
    color: "#e11d48",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

// Add keyframes animation & custom font imports via style block
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default Dashboard;