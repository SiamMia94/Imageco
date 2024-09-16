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
        document.querySelector('.preview-section').style.display = 'block';
    }
});

document.getElementById('convert-image').addEventListener('click', function() {
    const files = document.getElementById('image-input').files;
    const container = document.getElementById('converted-images-container');
    container.innerHTML = '';
    const downloadButton = document.getElementById('converted-download-button');
    let totalConvertedSize = 0;

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
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    let format = document.getElementById('format').value;

                    if (format === 'svg') {
                        const svgString = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
                                <image href="${img.src}" width="${img.width}" height="${img.height}" />
                            </svg>
                        `;
                        const blob = new Blob([svgString], { type: 'image/svg+xml' });
                        handleBlob(blob, file, format, zip, container);
                    } else {
                        let mimeType = `image/${format}`;
                        if (format === 'raw') {
                            mimeType = 'image/png'; // Using PNG as a placeholder for RAW
                        }

                        canvas.toBlob(function(blob) {
                            handleBlob(blob, file, format, zip, container);
                        }, mimeType);
                    }
                }
            }
            reader.readAsDataURL(file);
        });

        function handleBlob(blob, file, format, zip, container) {
            totalConvertedSize += blob.size;
            const url = URL.createObjectURL(blob);
            const convertedImg = new Image();
            convertedImg.src = url;
            convertedImg.style.maxWidth = '256px';
            convertedImg.style.maxHeight = '256px';
            container.appendChild(convertedImg);

            zip.file(file.name.replace(/\.[^/.]+$/, `.${format}`), blob);
            processedCount++;

            if (files.length === 1) {
                downloadButton.onclick = function() {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `converted-image.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
            } else if (processedCount === files.length) {
                zip.generateAsync({ type: "blob" }).then(function(content) {
                    downloadButton.onclick = function() {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(content);
                        a.download = 'converted-images.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                });
            }

            document.getElementById('converted-size').textContent = `Total Converted Size: ${Math.round(totalConvertedSize / 1024)} KB`;
            document.getElementById('converted-output').style.display = 'block';
        }
    } else {
        alert('Please select image files.');
    }
});
