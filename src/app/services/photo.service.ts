import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FirebaseServicesService} from './firebase-services.service';



const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;
  private firebaseService: FirebaseServicesService;

  constructor(platform: Platform,firebaseService:FirebaseServicesService) {
    this.platform = platform;
    this.firebaseService = firebaseService;
  }

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, 
      source: CameraSource.Camera, 
      quality: 100 
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: this.platform.is('hybrid')
              ? JSON.stringify(this.photos)
              : JSON.stringify(this.photos.map(p => {
                // Don't save the base64 representation of the photo data,
                // since it's already saved on the Filesystem
                const photoCopy = { ...p };
                delete photoCopy.base64;
    
                return photoCopy;
        }))
    });
  }

  public openImage(photo){
    console.log(photo);
  }

  private async savePicture(cameraPhoto: CameraPhoto) { 

    const base64Data = await this.readAsBase64(cameraPhoto);

  // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {

    const response = await fetch(cameraPhoto.webPath);
    const blob = await response.blob();
    this.firebaseService.uploadFile(blob);
    // Fetch the photo, read as a blob, then convert to base64 format
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });
      return file.data;
    }
    else {
      return await this.convertBlobToBase64(blob) as string;
    }  
  }

  

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    // Retrieve cached photo array data
    const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photos.value) || [];
  
    // more to come...
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
        });
  
        // Web platform only: Save the photo into the base64 field
        photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  public async resolve(route: ActivatedRouteSnapshot){
    let index = route.paramMap.get('position');
    return index;
  }

 

  public async getPhoto(index)
  {
    const photos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = JSON.parse(photos.value) || [];
    let photo = this.photos[index];
  
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
    
        // Read each saved photo's data from the Filesystem     
          const readFile = await Filesystem.readFile({
              path: photo.filepath,
              directory: FilesystemDirectory.Data
          });
          // Web platform only: Save the photo into the base64 field
          photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
          return photo;
    }
    else{
      return photo;
    }
  }
}

interface Photo {
  filepath: string;
  webviewPath: string;
  base64?: string;
}
