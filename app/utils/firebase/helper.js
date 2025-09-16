import * as ImageManipulator from 'expo-image-manipulator';
import { FIRE_BASE_Storage } from "../../../firebaseConfig";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
  } from "firebase/storage";
export const uploadToFirebase = async (uri, name, onProgress) => {
    try {

        const fetchResponse = await fetch(uri);
        const theBlob = await fetchResponse.blob();

        const imageRef = ref(FIRE_BASE_Storage, `images/${name}`);

        const uploadTask = uploadBytesResumable(imageRef, theBlob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress && onProgress(progress);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.log(error);
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        downloadUrl,
                        metadata: uploadTask.snapshot.metadata,
                    });
                }
            );
        })
    } catch (err) {
        console.log('error upladoing to firebase', err)
    }
}


export const uploadAudioToFirebase = async (uri, name, onProgress) => {
    try {
        const fetchResponse = await fetch(uri);
        const theBlob = await fetchResponse.blob();

        const audioRef = ref(FIRE_BASE_Storage, `audio/${name}`);

        const uploadTask = uploadBytesResumable(audioRef, theBlob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress && onProgress(progress);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.log(error);
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        downloadUrl,
                        metadata: uploadTask.snapshot.metadata,
                    });
                }
            );
        });
    } catch (err) {
        console.log('expo-updates', err);
    }
}
// Add this function to resize and compress the image
export const resizeAndCompressImage = async (uri) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }], // Resize to 800px width
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70%
  );
  return manipResult.uri;
};


