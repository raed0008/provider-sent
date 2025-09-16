import React from "react";
import { useFormikContext } from "formik";

import AppButton from "../AppButton";

function SubmitButton({ title ,style,disabled=false,textStyle}) {
  const { handleSubmit } = useFormikContext();

  return <AppButton title={title} textStyle={textStyle} disabled={disabled} onPress={handleSubmit}  style={style}/>;
}

export default SubmitButton;