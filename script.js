/**
 * Coded by Jerickson Mayor
 */
let shouldContinueProcessing = true;
function convert() {
  const APIKEY = 'f6a5076aaamsh068e5bef20f4c60p125dcbjsn23685700616b';
  const videoURL = document.getElementById('videoURL').value;
  const videoID = extractVideoId(videoURL);
  let formatSelected = document.querySelector('.selected-option').textContent.toLowerCase();
  let APIHOST;
  let APIURL;

  switch (formatSelected) {
    case 'mp3':
      APIHOST = 'youtube-mp36.p.rapidapi.com';
      APIURL = 'https://youtube-mp36.p.rapidapi.com/dl';

      break;
    default:
      APIHOST = 'ytstream-download-youtube-videos.p.rapidapi.com';
      APIURL = 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl';
      break;
  }

  if (!isValidYouTubeUrl(videoURL)) {
    showErrorMessage('Please enter a valid YouTube video URL');
    return;
  }

  document.querySelector('.loading-container').style.display = 'flex';

  const options = {
    method: 'GET',
    url: APIURL,
    params: {
      id: videoID
    },
    headers: {
      'X-RapidAPI-Key': APIKEY,
      'X-RapidAPI-Host': APIHOST
    }
  };

  axios
    .request(options)
    .then((response) => {
      const status = response.data.status;
      if (status === 'processing' && shouldContinueProcessing) {
        setTimeout(convert, 1000);
        return;
      }
      shouldContinueProcessing = false;
      const thumbnail = response.data.thumbnail;
      // const thumb = response.data.thumb;
      const title = response.data.title;
      const mp3Link = response.data.link;
      const formats = response.data.formats;
      const formatsContainer = document.querySelector('.formats-container');

      if (formatSelected === 'mp3' && mp3Link) {
        var formatDiv = document.createElement('div');
        formatDiv.className = 'format';
        formatDiv.innerHTML =
          '<span>Format: MP3 </span>' + '<a href="' + mp3Link + '" class="download-btn" download>Download</a>';
        formatsContainer.appendChild(formatDiv);
        // document.querySelector('.thumbnail img').src = thumb;

        getMp3Thumbnail(videoID, APIKEY)
          .then((thumbnail) => {
            // Use the thumbnail URL here
            document.querySelector('.thumbnail img').src = thumbnail;
          })
          .catch((error) => {
            console.error('Error fetching MP4 thumbnail:', error.message);
          });
        document.querySelector('.thumbnail a').href = videoURL;
      } else {
        if (formats && thumbnail) {
          formats.forEach(function (format) {
            var formatDiv = document.createElement('div');
            formatDiv.className = 'format';
            formatDiv.innerHTML =
              '<span>Format: ' +
              mapFormat(format.mimeType) +
              '</span>' +
              '<a href="' +
              format.url +
              '" class="download-btn" download>Download</a>';
            formatsContainer.appendChild(formatDiv);
          });
        }

        document.querySelector('.thumbnail img').src = thumbnail[1].url;
        document.querySelector('.thumbnail a').href = videoURL;
      }

      document.querySelector('.thumbnail .title').textContent = title;

      // Hide loading animation
      document.querySelector('.loading-container').style.display = 'none';

      document.querySelectorAll('.format').forEach(function (format) {
        format.style.display = 'block';
      });
      document.querySelector('img').style.display = 'inline-block';
      document.querySelector('.title').style.display = 'block';

      document.querySelectorAll('.download-btn').forEach(function (btn) {
        btn.style.display = 'inline-block';
      });

      // Show thumbnails, formats, and download buttons
      document.querySelector('.thumbnail').style.display = 'block';

      document.getElementById('convert-again').style.display = 'inline-block';
    })
    .catch((error) => {
      console.error('Error:', error.message);
      document.querySelector('.loading-container').style.display = 'none';

      document.getElementById('input-container').style.display = 'block';

      if (error.response) {
        // The request was made and the server responded with a status code
        const statusCode = error.response.status;

        if (statusCode === 429) {
          showErrorMessage('API request limit exceeded.');
        } else if (statusCode === 403) {
          showErrorMessage('You are not subscribed to this API.');
        } else {
          showErrorMessage('An error occurred. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        showErrorMessage('No response received from the server.');
      } else {
        // Something happened in setting up the request that triggered an error
        showErrorMessage('An error occurred.');
      }
      return;
      // Handle errors or show an alert
    });

  // Hide input and convert button, show Convert Again button
  document.getElementById('input-container').style.display = 'none';
}

function convertAgain() {
  // Reload the page
  location.reload();
  document.getElementById('videoURL').value = '';
}
function extractVideoId(url) {
  // Check if it's a shorts link first
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);

  if (shortsMatch) {
    // For shorts links, return the ID after "youtube.com/shorts/"
    return shortsMatch[1];
  }

  // Check if it's a youtu.be link
  const youtuBeMatch = url.match(/youtu\.be\/([^?&]+)/);

  if (youtuBeMatch) {
    // For youtu.be links, return the ID after "youtu.be/"
    return youtuBeMatch[1];
  }

  // Check if it's a regular YouTube link
  const regularMatch = url.match(/[?&](v|vi)=([^&]+)/);

  return regularMatch ? regularMatch[2] : null;
}

// Function to map mime types to user-friendly formats
function mapFormat(mimeType) {
  if (mimeType.includes('3gpp')) {
    return '3GP ';
  } else if (mimeType.includes('mp4') && !mimeType.includes('avc1.64001F')) {
    return 'MP4 ';
  } else if (mimeType.includes('mp4') && mimeType.includes('avc1.64001F')) {
    return 'MP4 HD ';
  } else {
    // Add additional mappings as needed
    return mimeType; // Default to the original mime type if no match is found
  }
}
function isValidYouTubeUrl(url) {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?.*v=|embed\/|v\/|c\/|u\/\w\/|user\/\w+|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)[^"&?\/\s]+(.*)?$/;

  return youtubeRegex.test(url);
}

function showErrorMessage(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';

  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 2000);
}
function validateAndProceed() {
  const videoURL = document.getElementById('videoURL').value;

  if (isValidYouTubeUrl(videoURL)) {
    console.log('Valid YouTube URL');
    // Proceed with your logic here
  } else {
    showErrorMessage('Please enter a valid YouTube video URL');
  }
}
document.addEventListener('DOMContentLoaded', function () {
  const customDropdown = document.getElementById('customDropdown');
  const selectedOption = document.getElementById('selectedOption');
  const dropdownOptions = document.getElementById('dropdownOptions');
  const options = document.querySelectorAll('.option');

  // Toggle the dropdown display and update ARIA attributes
  selectedOption.addEventListener('click', function () {
    const isExpanded = customDropdown.getAttribute('aria-expanded') === 'true';
    customDropdown.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    dropdownOptions.style.display = isExpanded ? 'none' : 'block';
  });

  // Handle option selection
  options.forEach(function (option) {
    option.addEventListener('click', function () {
      console.log(option.textContent);
      selectedOption.textContent = option.textContent;
      dropdownOptions.style.display = 'none';
      customDropdown.setAttribute('aria-expanded', 'false');
      // If you have unique IDs for each option, consider updating aria-activedescendant here
    });
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.custom-dropdown')) {
      dropdownOptions.style.display = 'none';
      customDropdown.setAttribute('aria-expanded', 'false');
    }
  });
});

function getMp3Thumbnail(videoID, APIKEY) {
  const mp4APIURL = 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl';
  const mp4APIHOST = 'ytstream-download-youtube-videos.p.rapidapi.com';

  const mp4Options = {
    method: 'GET',
    url: mp4APIURL,
    params: {
      id: videoID
    },
    headers: {
      'X-RapidAPI-Key': APIKEY,
      'X-RapidAPI-Host': mp4APIHOST
    }
  };

  return axios
    .request(mp4Options)
    .then((response) => {
      return response.data.thumbnail[1].url; // Assuming the thumbnail URL is available in the response
    })
    .catch((error) => {
      console.error('Error fetching MP4 thumbnail:', error.message);
      return null;
    });
}
// Add this script to clear the input field on page reload
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('videoURL').value = '';
});
