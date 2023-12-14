import { uploadImage, fetchImages, updateImage, deleteImage, showLoading, hideLoading } from '/firebase.js'

var input = document.getElementById("input");
var initLabel = document.getElementById("label");

document.addEventListener("DOMContentLoaded", async function() {
    const images = await fetchImages();
    handleUpdateWithServer(images);

    const column = document.getElementById("preview");
    new Sortable(column, {
        group: "shared",
        animation: 150,
        ghostClass: "blue-background-class"
      });
});

input.addEventListener("change", (event) => {
  const files = changeEvent(event);
  handleUpdate(files);
});

initLabel.addEventListener("mouseover", (event) => {
  event.preventDefault();
  const label = document.getElementById("label");
  label?.classList.add("label--hover");
});

initLabel.addEventListener("mouseout", (event) => {
  event.preventDefault();
  const label = document.getElementById("label");
  label?.classList.remove("label--hover");
});

document.addEventListener("dragenter", (event) => {
  event.preventDefault();
  if (event.target.className === "inner") {
    event.target.style.background = "#616161";
  }
});

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("dragleave", (event) => {
  event.preventDefault();
  if (event.target.className === "inner") {
    event.target.style.background = "#3a3a3a";
  }
});

document.addEventListener("drop", (event) => {
  event.preventDefault();
  if (event.target.className === "inner") {
    const files = event.dataTransfer?.files;
    event.target.style.background = "#3a3a3a";
    handleUpdate([...files]);
  }
});

function changeEvent(event){
  const { target } = event;
  return [...target.files];
};

function handleUpdate(fileList) {
    const preview = document.getElementById("preview");
  
    fileList.forEach((file) => {
      showLoading();
      if (file.type.startsWith('image/') && !isPSDFile(file.type)) {
        const reader = new FileReader();
        uploadImage(file)
            .then(([downloadURL, documentId]) => {
                reader.addEventListener("load", (event) => {
                    const img = el("img", {
                      className: "embed-img",
                      src: downloadURL,
                      'data-document-id': documentId
                    });
                    const remove = el("img", {
                      class: "remove",
                      src: '/img_close.png',
                      'data-document-id': documentId,
                      'data-collection': 'video'
                    })
                    const imgContainer = el("div", { className: "container-img" }, img, remove);
                    preview.append(imgContainer);

                    remove.addEventListener('click', async () => {
                      imgContainer.remove();
                      await deleteImage(documentId);
                    });
                  });
                  reader.readAsDataURL(file);
                  hideLoading();
            })
            .catch((error) => {
                hideLoading();
                alert(error);
            });
        
      } else {
        hideLoading();
        alert(`'${file.name}'은 이미지 파일이 아니거나 편집 파일입니다.`);
      }
    });
}
  
function isPSDFile(mimeType) {
    // PSD 파일의 MIME 타입 목록입니다.
    const psdMimeTypes = ["image/vnd.adobe.photoshop", "application/octet-stream"];

    return psdMimeTypes.includes(mimeType);
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

function handleUpdateWithServer(imageList) {
    const preview = document.getElementById("preview");
  
    imageList.forEach((item) => {
        const img = el("img", {
          className: "embed-img",
          src: item['address'],
          'data-document-id': item['documentId']
        });
        const remove = el("img", {
          class: "remove",
          src: '/img_close.png',
          'data-document-id': item['documentId'],
          'data-collection': 'video'
        })
        const imgContainer = el("div", { className: "container-img" }, img, remove);
        preview.append(imgContainer);

        remove.addEventListener('click', async () => {
          imgContainer.remove();
          await deleteImage(item['documentId']);
        });
    });
}

document.getElementById('updateImage').addEventListener('click', async function() {
    const images = document.querySelectorAll('.embed-img');
    
    showLoading()
    try {
      const promises = Array.from(images).map(async (item, index) => {
        const documentId = item.dataset.documentId;
        return updateImage(documentId, index);
      });
  
      await Promise.all(promises);
  
      hideLoading();
      console.log('All images updated successfully');
    } catch (error) {
      hideLoading();
      console.error('Error updating images:', error);
    }
  });

