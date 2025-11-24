import Image from "next/image";
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";

export default function ForgotPassword() {
  return (
    <form className="pt-40 pb-20 col-flex items-center max-w-[270px] mx-auto">

<h1 className="mb-28">Forgot password</h1>

<div className="col-flex gap-6 mb-15">
    <TextInput id="email" name="email" type="email" label="Email" placeholder="Enter your email" />
    <span className="text-center font-normal">In a few minutes, we will send a reset link to your email once we confirm it exists.</span>
</div>

<div className="w-full col-flex gap-3.5">
  <Button className="bg-foreground text-background w-full">Submit email</Button>  
  <Button className="border-2 border-foreground text-foreground w-full">Back to login</Button>  
</div>


    </form>
  );
}
