import { shortsInsert, fetchShorts, updateShorts, deleteShorts, showLoading, hideLoading } from './firebase.js'

function extractShortsId(url) {
  let shortsId = '';
  if (url.includes('youtube.com/shorts')) {
      const segments = url.split('/');
      shortsId =  segments[segments.length - 1].split('?')[0];
  } else if (url.includes('youtu.be')) {
      const segments = url.split('/');
      shortsId = segments[segments.length - 1];
  } else {
      const match = url.match(/[?&]v=([^&#]+)/);
      shortsId = match && match[1];
  }
  
  return 'https://www.youtube.com/embed/' + shortsId;
}

document.getElementById('addShorts').addEventListener('click', function(){
  const address = document.getElementById('shortsIframe').src;
  showLoading();
  shortsInsert(address)
    .then((documentId) => {
      handleUpdate(address, documentId);
      hideLoading();
    })
    .catch((error) => {
      hideLoading();
      alert(error);
    });
});

document.addEventListener("DOMContentLoaded", async function() {
  document.getElementById('shortsUrl').addEventListener('input', function(event) {
    const newValue = extractShortsId(event.target.value);
    const iframe = document.getElementById('shortsIframe');
    console.log(newValue);
    iframe.src = newValue;
  });

  const shortsList = await fetchShorts();
  handleUpdateWithServer(shortsList);

  const column = document.getElementById("shortsPreview");
  new Sortable(column, {
      group: "shared",
      animation: 150,
      ghostClass: "blue-background-class"
    });
});

function handleUpdateWithServer(shortsList) {
  const preview = document.getElementById("shortsPreview");
  
  shortsList.forEach((item) => {
    const list = item['address'].split('/');
    const shortsId = list[list.length -1];
    const shortsList = el("img", {
        className: "embed-shorts",
        src: `https://img.youtube.com/vi/${shortsId}/0.jpg`,
        'data-document-id': item['documentId']
      });
    const remove = el("img", {
      class: "remove",
      src: '/img_close.png',
      'data-document-id': item['documentId'],
      'data-collection': 'video'
    })

    const shortsContainer = el("div", { className: "container-shorts" }, shortsList, remove);
    preview.append(shortsContainer);

    remove.addEventListener('click', () => {
      shortsContainer.remove();
      deleteShorts(item['documentId']);
    });
  });
}

function handleUpdate(address, documentId) {
  const preview = document.getElementById("shortsPreview");

  const list = address.split('/');
  const shortsId = list[list.length -1];
  const shorts = el("img", {
      className: "embed-shorts",
      src: `https://img.youtube.com/vi/${shortsId}/0.jpg`,
      'data-document-id': documentId
    });
  const remove = el("img", {
    class: "remove",
    src: '/img_close.png',
    'data-document-id': documentId,
    'data-collection': 'video'
  })
  const shortsContainer = el("div", { className: "container-shorts" }, shorts, remove);
  preview.append(shortsContainer);

  remove.addEventListener('click', () => {
    shortsContainer.remove();
    deleteShorts(documentId);
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

document.getElementById('updateShorts').addEventListener('click', async function() {
  const shortsList = document.querySelectorAll('.embed-shorts');
  
  showLoading();
  try {
    const promises = Array.from(shortsList).map(async (item, index) => {
      const documentId = item.dataset.documentId;
      return updateShorts(documentId, index);
    });

    await Promise.all(promises);
    hideLoading();
    console.log('All images updated successfully');
  } catch (error) {
    hideLoading();
    console.error('Error updating images:', error);
  }
});