const fs = require('fs');
const path = require('path');

const talks = require('./talks.json');

const css = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #e9eff5; color: #333; line-height: 1.6; }
  .container { max-width: 960px; margin: 30px auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
  h1 { color: #004d99; text-align: center; margin-bottom: 30px; font-size: 2.5em; }
  h2 { color: #0056b3; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 40px; }
  .schedule-item { background-color: #f8fcff; border-left: 6px solid #007bff; margin-bottom: 20px; padding: 20px; border-radius: 8px; transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
  .schedule-item:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
  .schedule-item.break { background-color: #f0f4f8; border-left: 6px solid #99aab5; }
  .schedule-item h3 { margin-top: 0; color: #004085; font-size: 1.4em; }
  .schedule-item p { margin: 8px 0; font-size: 0.95em; }
  .schedule-item .time { font-weight: bold; color: #007bff; font-size: 1.1em; }
  .schedule-item .speakers { font-weight: 600; color: #555; }
  .schedule-item .category { font-style: italic; color: #777; font-size: 0.85em; }
  .search-container { margin-bottom: 30px; }
  .search-container input { width: calc(100% - 22px); padding: 12px 10px; border: 1px solid #cccccc; border-radius: 6px; font-size: 1em; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); transition: border-color 0.2s; }
  .search-container input:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); }
`;

const js = `
  const talksData = ${JSON.stringify(talks)};
  const eventStartTime = 10 * 60; // 10:00 AM in minutes from midnight
  const talkDuration = 60; // minutes
  const transitionDuration = 10; // minutes
  const lunchStartAfterTalkIndex = 2; // Lunch starts after the 2nd talk
  const lunchDuration = 60; // minutes

  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return \`\${formattedHours}:\${mins.toString().padStart(2, '0')} \${ampm}\`;
  }

  function generateSchedule(filteredTalks = talksData) {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = '';
    let currentTime = eventStartTime;
    let currentTalkCount = 0;

    talksData.forEach((talk, index) => {
      // Insert lunch break after the specified number of talks
      if (currentTalkCount === lunchStartAfterTalkIndex) {
        const lunchEndTime = currentTime + lunchDuration;
        scheduleContainer.innerHTML += \`
          <div class="schedule-item break">
            <h3 class="time">\${formatTime(currentTime)} - \${formatTime(lunchEndTime)}: Lunch Break</h3>
            <p>Enjoy a delicious meal and networking!</p>
          </div>
        \`;
        currentTime = lunchEndTime + transitionDuration; // Add transition after lunch
      }

      const talkStartTime = currentTime;
      const talkEndTime = currentTime + talkDuration;
      
      const talkElement = \`
        <div class="schedule-item">
          <h3 class="time">\${formatTime(talkStartTime)} - \${formatTime(talkEndTime)}: \${talk.title}</h3>
          <p class="speakers">Speakers: \${talk.speakers.join(', ')}</p>
          <p>\${talk.description}</p>
          <p class="category">Categories: \${talk.category.join(', ')}</p>
        </div>
      \`;

      // Only display the talk if it's in the filtered list
      if (filteredTalks.includes(talk)) {
        scheduleContainer.innerHTML += talkElement;
      }
      
      currentTime = talkEndTime + transitionDuration; // Add transition after each talk
      currentTalkCount++;
    });
  }

  function searchTalks() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filteredTalks = talksData.filter(talk =>
      talk.category.some(cat => cat.toLowerCase().includes(searchTerm)) ||
      talk.title.toLowerCase().includes(searchTerm) ||
      talk.speakers.some(speaker => speaker.toLowerCase().includes(searchTerm))
    );
    generateSchedule(filteredTalks);
  }

  document.addEventListener('DOMContentLoaded', () => {
    generateSchedule();
    document.getElementById('search-input').addEventListener('keyup', searchTalks);
  });
`;

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Talk Event Schedule</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="container">
        <h1>Tech Talk Event Schedule</h1>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search by category, title, or speaker...">
        </div>
        <div id="schedule">
            <!-- Schedule items will be loaded here by JavaScript -->
        </div>
    </div>
    <script>
        ${js}
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), htmlTemplate);
console.log('index.html generated successfully!');

