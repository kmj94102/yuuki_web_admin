import { videoInsert, fetchVideos, updateVideo, deleteVideo, showLoading, hideLoading } from './firebase.js'

function extractVideoId(url) {
  let videoId = '';
  if (url.includes('youtube.com/shorts')) {
      const segments = url.split('/');
      videoId =  segments[segments.length - 1].split('?')[0];
  } else if (url.includes('youtu.be')) {
      const segments = url.split('/');
      videoId = segments[segments.length - 1];
  } else {
      const match = url.match(/[?&]v=([^&#]+)/);
      videoId = match && match[1];
  }
  
  return 'https://www.youtube.com/embed/' + videoId;
}

document.getElementById('addVideo').addEventListener('click', function(){
  const address = document.getElementById('videoIframe').src;
  videoInsert(address)
    .then((documentId) => {
      handleUpdate(address, documentId);
    })
    .catch((error) => {
      alert(error);
    });
});

document.addEventListener("DOMContentLoaded", async function() {
  document.getElementById('videoUrl').addEventListener('input', function(event) {
    const newValue = extractVideoId(event.target.value);
    const iframe = document.getElementById('videoIframe');
    console.log(newValue);
    iframe.src = newValue;
  });

  const videos = await fetchVideos();
  handleUpdateWithServer(videos);

  const column = document.getElementById("videoPreview");
  new Sortable(column, {
      group: "shared",
      animation: 150,
      ghostClass: "blue-background-class"
    });
});

function handleUpdateWithServer(videoList) {
  const preview = document.getElementById("videoPreview");
  
  videoList.forEach((item) => {
    const list = item['address'].split('/');
    const videoId = list[list.length -1];
    const video = el("img", {
        className: "embed-video",
        src: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        'data-document-id': item['documentId']
      });
    const remove = el("img", {
      class: "remove",
      src: './img_close.png',
      'data-document-id': item['documentId'],
      'data-collection': 'video'
    })
    const videoContainer = el("div", { className: "container-video" }, video, remove);
    preview.append(videoContainer);

    remove.addEventListener('click', () => {
      videoContainer.remove();
      deleteVideo(item['documentId']);
    });
  });
}

function handleUpdate(address, documentId) {
  const preview = document.getElementById("videoPreview");

  const list = address.split('/');
  const videoId = list[list.length -1];
  console.log(address + ' / ' + videoId);
  const video = el("img", {
      className: "embed-video",
      src: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      'data-document-id': documentId
    });
  const remove = el("img", {
    class: "remove",
    src: './img_close.png',
    'data-document-id': documentId,
    'data-collection': 'video'
  })
  const videoContainer = el("div", { className: "container-video" }, video, remove);
  preview.append(videoContainer);

  remove.addEventListener('click', () => {
    videoContainer.remove();
    deleteVideo(documentId);
  });
}

function el(nodeName, attributes, ...children) {
  const node =
    nodeName === "fragment"
      ? document.createDocumentFragment()
      : document.createElement(nodeName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "events") {
      Object.entries(value).forEach(([type, listener]) => {
        node.addEventListener(type, listener);
      });
    } else if (key in node) {
      try {
        node[key] = value;
      } catch (err) {
        node.setAttribute(key, value);
      }
    } else {
      node.setAttribute(key, value);
    }
  });

  children.forEach((childNode) => {
    if (typeof childNode === "string") {
      node.appendChild(document.createTextNode(childNode));
    } else {
      node.appendChild(childNode);
    }
  });

  return node;
}

document.getElementById('updateVideo').addEventListener('click', async function() {
  const videos = document.querySelectorAll('.embed-video');
  
  showLoading()
  try {
    const promises = Array.from(videos).map(async (item, index) => {
      const documentId = item.dataset.documentId;
      return updateVideo(documentId, index);
    });

    await Promise.all(promises);

    hideLoading();
    console.log('All images updated successfully');
  } catch (error) {
    hideLoading();
    console.error('Error updating images:', error);
  }
});