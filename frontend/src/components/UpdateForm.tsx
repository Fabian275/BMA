import {
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Snackbar,
  Card,
} from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import { t } from "i18next";

interface Entry {
  title: string;
  date: Date | null;
  description: string;
  transcribed_text?: string;
}

interface Props {
  entry: Entry;
  setEntry: React.Dispatch<React.SetStateAction<Entry>>;
  fetchEntry: () => void;
}

const UpdateForm = (props: Props) => {
  const { token } = useAuth();
  const { entry, setEntry, fetchEntry } = props;
  const [notification, setNotification] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  const handleUpdateEntry = async () => {
    await fetch(`http://localhost:5001/api/transcriptions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(entry),
    })
      .then((response) => {
        if (response.ok) {
          setNotification(t("entryUpdated"));
        } else {
          setNotification(t("error_updating_entry"));
        }
      })
      .catch((error) => console.error("Error creating entry:", error));
  };

  return (
    <Card sx={{ px: 2, pt: 2 }}>
      <Box
        component="form"
        noValidate
        sx={{ mt: 1, mb: 2, display: "flex", flexDirection: "column" }}
      >
        <Grid container spacing={2} mb={2}>
          <TextField
            required
            fullWidth
            label={t("title")}
            value={entry.title}
            onChange={(e) => setEntry({ ...entry, title: e.target.value })}
          />
        </Grid>
        <TextField
          fullWidth
          label={t("description")}
          multiline
          rows={4}
          value={entry?.description || ""}
          onChange={(e) => setEntry({ ...entry, description: e.target.value })}
        />
        <Grid container spacing={2} mb={2} justifyContent="space-between">
          <Grid item lg={2} sm={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                fetchEntry();
              }}
              sx={{ mt: 2 }}
            >
              <UndoIcon />
            </Button>
          </Grid>
          <Grid item lg={2} sm={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleUpdateEntry}
              sx={{ mt: 2 }}
            >
              <SaveIcon />
            </Button>
          </Grid>
        </Grid>
        {notification && (
          <Snackbar
            open={notification !== null}
            autoHideDuration={1000}
            onClose={() => setNotification(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setNotification(null)}
              severity={notification === "error" ? "error" : "success"}
              sx={{ width: "100%" }}
              variant="filled"
            >
              {notification}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Card>
  );
};

export default UpdateForm;
