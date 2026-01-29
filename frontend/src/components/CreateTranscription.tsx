import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Snackbar,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

interface Entry {
  title: string;
  location: string;
  date: Date | null;
  description: string;
  transcribed_text?: string;
  summary_text?: string | null;
}

interface Props {
  entry: Entry;
  setEntry: React.Dispatch<React.SetStateAction<Entry>>;
  fetchEntry: () => void;
  setChanges: React.Dispatch<React.SetStateAction<boolean>>;
  changes: boolean;
  originalText: string | null;
}

const CreateTranscription = (props: Props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { token } = useAuth();

  const { entry, setEntry, fetchEntry, setChanges } = props;
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [changedText, setChangedText] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const options = { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 96000 };
      const recorder = new MediaRecorder(audioStream, options);
      const chunks: BlobPart[] = [];
      let currentSize = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          currentSize += event.data.size;

          if (currentSize > 24.5 * 1024 * 1024) {
            recorder.stop();
          }
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });

        if (audioBlob.size > 25 * 1024 * 1024) {
          setError(t("fileTooLarge"));
          setFile(null);
          setFileURL(null);
        } else {
          const audioFile = new File([audioBlob], "recording.webm", {
            type: "audio/webm",
          });
          setFile(audioFile);
          setFileURL(URL.createObjectURL(audioBlob));
          setError("");
        }

        audioStream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setStream(null);
      };

      setStream(audioStream);
      setMediaRecorder(recorder);
      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Fehler beim Starten der Aufnahme:", err);
      setError("Fehler beim Zugriff auf das Mikrofon.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError(t("no_file_selected"));
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/transcriptions/${id}/audio`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setNotification("Erfolgreich erstellt.");
        fetchEntry();
      } else {
        setError(t("transcriptionError"));
      }
    } catch (error: any) {
      console.error("Fehler beim Hochladen der Datei:", error);
      if (error.response?.status === 422) {
        setError(t("notTextTranscribed"));
      } else {
        setError(t("uploadError"));
      }
    } finally {
      setLoading(false);
    }
  };
  const getAudioFile = async () => {
    if (entry.transcribed_text) {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/transcriptions/${id}/audio`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          const audioBlob = response.data;
          const audioUrl = URL.createObjectURL(audioBlob);
          setFileURL(audioUrl);
          setFile(new File([audioBlob], "AudioFile", { type: audioBlob.type }));
        } else {
          setError(t("audioFileError"));
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Audiodatei:", error);
        setError(t("audioFileError"));
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/transcriptions/${id}/text`,
        { text: entry.transcribed_text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setNotification("Erfolgreich gespeichert.");
        setChanges(false);
        fetchEntry();
      } else {
        setError(t("saveError"));
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      setError(t("saveError"));
    }
  };

  const deleteAudioFile = async () => {
    if (entry.transcribed_text) {
      try {
        const response = await axios.delete(
          `http://localhost:5001/api/transcriptions/${id}/audio`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.status === 204) {
          setFile(null);
          setFileURL(null);
          setOpen(false);
          fetchEntry();
          setNotification(t("audioFileDeleted"));
          console.log(entry);
        } else {
          setError(t("deleteError"));
        }
      } catch (error) {
        console.error("Fehler beim Löschen der Audiodatei:", error);
        setError(t("deleteError"));
      }
    } else {
      setFile(null);
      setFileURL(null);
      setOpen(false);
      fetchEntry();
      setNotification(t("audioFileDeleted"));
    }
  };

  useEffect(() => {
    if (props.originalText !== changedText && changedText !== null) {
      setChanges(true);
    } else if (props.originalText === changedText ) {
      setChanges(false);
      
    }
  },[changedText, props.originalText]);

  useEffect(() => {
    getAudioFile();
  }, [entry.transcribed_text]);

  return (
    <Box sx={{ margin: "auto", mt: 4 }}>
      <Card sx={{ my: 4, px: 2, pt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #000",
            p: 2,
            mb: 2,
            gap: 2,
          }}
        >
          <Button variant="outlined" component="label" disabled={!!file}>
            {t("upload_audio")}
            <input
              type="file"
              accept=".flac,.m4a,.mp3,.mp4,.mpeg,.mpga,.oga,.ogg,.wav,.webm"
              hidden
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                const maxSize = 25 * 1024 * 1024;
                if (selectedFile && selectedFile.size > maxSize) {
                  setError(t("fileTooLarge"));
                  setFile(null);
                  setFileURL(null);
                  e.target.value = "";
                  return;
                }
                if (selectedFile) {
                  setFile(selectedFile);
                  setFileURL(URL.createObjectURL(selectedFile));
                  setError("");
                }
              }}
            />
          </Button>

          <Box
            sx={{
              width: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            {file && fileURL ? (
              <Box my="auto">
                <audio controls>
                  <source src={fileURL} />
                  {t("audio_not_supported")}
                </audio>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary"></Typography>
            )}
          </Box>
          {file ? (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setOpen(true);
              }}
            >
              <DeleteIcon />
            </Button>
          ) : <Button disabled />}
        </Box>

        <Box sx={{ mb: 2 }}>
          {isRecording ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={stopRecording}
              fullWidth
            >
              {t("stop_recording")}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={startRecording}
              fullWidth
              disabled={!!file}
            >
              {t("start_recording")}
            </Button>
          )}
        </Box>

        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading && entry.transcribed_text !== undefined || entry.transcribed_text !== null}
          >
            {loading ? <CircularProgress size={24} /> : t("submit_audio")}
          </Button>
        </Box>
      </Card>
      {(entry.transcribed_text || entry.transcribed_text === "") && (
        <Card>
          <CardContent>
            <Typography variant="h6">{t("transcription")}</Typography>
            <TextField
              label={t("transcription")}
              multiline
              minRows={4}
              variant="outlined"
              value={entry.transcribed_text}
              onChange={(e) => {
                setEntry((prev) => ({
                  ...prev,
                  transcribed_text: e.target.value,
                }));
                setChangedText(e.target.value);
              }}
              fullWidth
              sx={{ mb: 0 }}
            />
          </CardContent>
            <Typography variant="body2" color="textSecondary" sx={{  textAlign: "left", pl: 2, mb:2}}>
            {t("word_count")}: {entry.transcribed_text?.split(/\s+/).filter((word) => word).length || 0}
            </Typography>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Button
              variant="outlined"
              color="primary"
              disabled={!props.changes}
              onClick={() => {
                fetchEntry();
              }}
            >
              <UndoIcon />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleSave();
              }}
              disabled={!props.changes}
            >
              <SaveIcon />
            </Button>
          </Grid>
        </Card>
      )}

      {notification && (
        <Snackbar
          open={notification !== null}
          autoHideDuration={1000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity="success"
            sx={{ width: "100%" }}
            variant="filled"
          >
            {notification}
          </Alert>
        </Snackbar>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{t("deleteEntry")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {t("deleteEntryConfirmation")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button onClick={deleteAudioFile} autoFocus color="error">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTranscription;
