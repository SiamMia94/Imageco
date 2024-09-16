document.querySelector('.upload-container').addEventListener('click', () => {
    document.getElementById('image-input').click();
});

document.getElementById('image-input').addEventListener('change', function() {
    const files = this.files;
    const container = document.getElementById('original-images-container');
    container.innerHTML = '';

    if (files.length > 0) {
        let totalSize = 0;

        Array.from(files).forEach(file => {
            totalSize += file.size;
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.style.maxWidth = '256px';
                img.style.maxHeight = '256px';
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });

        document.getElementById('original-size').textContent = `Total Original Size: ${Math.round(totalSize / 1024)} KB`;

        // Mengisi nilai default untuk input resize image
        const firstFile = files[0];
        const img = new Image();
        img.onload = function() {
            document.getElementById('resize-width').value = this.width;
            document.getElementById('resize-height').value = this.height;
        };
        img.src = URL.createObjectURL(firstFile);

        document.querySelector('.preview-section').style.display = 'block';
    }
});

document.getElementById('resize-image').addEventListener('click', function() {
    const files = document.getElementById('image-input').files;
    const container = document.getElementById('resized-images-container');
    container.innerHTML = '';
    const downloadButton = document.getElementById('resized-download-button');
    let totalResizedSize = 0;

    const resizeWidth = document.getElementById('resize-width').value;
    const resizeHeight = document.getElementById('resize-height').value;

    if (files.length > 0) {
        const zip = new JSZip();
        let processedCount = 0;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = resizeWidth || img.width;
                    canvas.height = resizeHeight || img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(function(blob) {
                        totalResizedSize += blob.size;
                        const url = URL.createObjectURL(blob);
                        const resizedImg = new Image();
                        resizedImg.src = url;
                        resizedImg.style.maxWidth = '256px';
                        resizedImg.style.maxHeight = '256px';
                        container.appendChild(resizedImg);

                        zip.file(file.name.replace(/\.[^/.]+$/, ".jpg"), blob);
                        processedCount++;

                        if (files.length === 1) {
                            downloadButton.onclick = function() {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'resized-image.jpg';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            };
                        } else if (processedCount === files.length) {
                            zip.generateAsync({ type: "blob" }).then(function(content) {
                                downloadButton.onclick = function() {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(content);
                                    a.download = 'resized-images.zip';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                };
                            });
                        }

                        document.getElementById('resized-size').textContent = `Total Resized Size: ${Math.round(totalResizedSize / 1024)} KB`;
                        document.getElementById('resized-output').style.display = 'block';
                    }, 'image/jpeg');
                }
            }
            reader.readAsDataURL(file);
        });
    } else {
        alert('Please select image files.');
    }
});