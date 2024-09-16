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

document.getElementById('compress-image').addEventListener('click', function() {
    const files = document.getElementById('image-input').files;
    const container = document.getElementById('compressed-images-container');
    container.innerHTML = '';
    const downloadButton = document.getElementById('compressed-download-button');
    let totalCompressedSize = 0;

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

                    let quality = document.getElementById('compression-rate').value / 100;
                    canvas.toBlob(function(blob) {
                        totalCompressedSize += blob.size;
                        const url = URL.createObjectURL(blob);
                        const compressedImg = new Image();
                        compressedImg.src = url;
                        compressedImg.style.maxWidth = '256px';
                        compressedImg.style.maxHeight = '256px';
                        container.appendChild(compressedImg);

                        zip.file(file.name.replace(/\.[^/.]+$/, ".jpg"), blob);
                        processedCount++;

                        if (files.length === 1) {
                            downloadButton.onclick = function() {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'compressed-image.jpg';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            };
                        } else if (processedCount === files.length) {
                            zip.generateAsync({ type: "blob" }).then(function(content) {
                                downloadButton.onclick = function() {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(content);
                                    a.download = 'compressed-images.zip';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                };
                            });
                        }

                        document.getElementById('compressed-size').textContent = `Total Compressed Size: ${Math.round(totalCompressedSize / 1024)} KB`;
                        document.getElementById('compressed-output').style.display = 'block';
                    }, 'image/jpeg', quality);
                }
            }
            reader.readAsDataURL(file);
        });
    } else {
        alert('Please select image files.');
    }
});
