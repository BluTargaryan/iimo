


export const compositeThumbnailOnPhoto = async (
    photoFile: File,
    thumbnailFile: File
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const photoImg = new Image()
      const thumbnailImg = new Image()
      
      const photoUrl = URL.createObjectURL(photoFile)
      const thumbnailUrl = URL.createObjectURL(thumbnailFile)
      
      photoImg.onload = () => {
        thumbnailImg.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas')
          canvas.width = photoImg.width
          canvas.height = photoImg.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw base photo
          ctx.drawImage(photoImg, 0, 0)
          
          // Draw thumbnail overlay at bottom-right corner (small size)
          const thumbnailAspect = thumbnailImg.width / thumbnailImg.height
          
          // Set thumbnail size as a percentage of photo dimensions (e.g., 20% of photo width)
          const thumbnailSizeRatio = 0.2 // 20% of photo width
          let overlayWidth = photoImg.width * thumbnailSizeRatio
          let overlayHeight = overlayWidth / thumbnailAspect
          
          // Ensure thumbnail doesn't exceed reasonable bounds
          const maxThumbnailHeight = photoImg.height * 0.3 // Max 30% of photo height
          if (overlayHeight > maxThumbnailHeight) {
            overlayHeight = maxThumbnailHeight
            overlayWidth = overlayHeight * thumbnailAspect
          }
          
          // Position at bottom-right with some padding
          const padding = photoImg.width * 0.02 // 2% padding
          const overlayX = photoImg.width - overlayWidth - padding
          const overlayY = photoImg.height - overlayHeight - padding
          
          ctx.drawImage(thumbnailImg, overlayX, overlayY, overlayWidth, overlayHeight)
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }
            
            // Create File from blob
            const fileName = photoFile.name.replace(/\.[^/.]+$/, '') + '_with_thumbnail.jpg'
            const file = new File([blob], fileName, { type: 'image/jpeg' })
            
            // Cleanup
            URL.revokeObjectURL(photoUrl)
            URL.revokeObjectURL(thumbnailUrl)
            
            resolve(file)
          }, 'image/jpeg', 0.95)
        }
        
        thumbnailImg.onerror = () => {
          URL.revokeObjectURL(photoUrl)
          URL.revokeObjectURL(thumbnailUrl)
          reject(new Error('Failed to load thumbnail'))
        }
        
        thumbnailImg.src = thumbnailUrl
      }
      
      photoImg.onerror = () => {
        URL.revokeObjectURL(photoUrl)
        URL.revokeObjectURL(thumbnailUrl)
        reject(new Error('Failed to load photo'))
      }
      
      photoImg.src = photoUrl
    })
  }