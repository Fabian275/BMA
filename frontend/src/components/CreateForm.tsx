import { Box, Grid, TextField, Button, Alert, Snackbar } from "@mui/material";
import React, { useState } from "react";
import { Add as AddIcon } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
interface CreateFormProps {
  fetchEntries: () => Promise<void>;
}

const CreateForm: React.FC<CreateFormProps> = ({ fetchEntries }) => {
  const { token } = useAuth();
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState<"success" | "error" | null>(
    null
  );

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setTitle("");
    setDescription("");
  };

  const handleCreateEntry = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/transcriptions",
        {
          title: title || null,
          description: description || null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setNotification("success");
      await fetchEntries();
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (error) {
      setNotification("error");
      console.error("Error creating entry:", error);
    }
  };

  return (
    <Box mt={6}>
      {showForm && (
        <Box
          component="form"
          noValidate
          sx={{ mt: 1, mb: 2, display: "flex", flexDirection: "column" }}
        >
          <Grid container spacing={2} mb={2}>
            <Grid item size={12} sm={6}>
              <TextField
                required
                fullWidth
                label={t("title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label={t("description")}
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} sm={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleToggleForm}
                sx={{ mt: 2 }}
              >
                {t("cancel")}
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateEntry}
                sx={{ mt: 2 }}
              >
                {t("create")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {!showForm && (
        <Box textAlign="left" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleToggleForm}
          >
            {t("create")}
          </Button>
        </Box>
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
            severity={notification === "success" ? "success" : "error"}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {notification === "success"
              ? t("entryCreated")
              : t("entryCreationError")}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default CreateForm;
