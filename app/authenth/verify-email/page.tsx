import Image from "next/image";
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";

export default function VerifyEmail() {
  return (
    <form className=" col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">

<div className="w-64 col-flex items-center gap-4 mb-28">
<h1 className="">Verify your email</h1>
<span className="text-error">Error message</span>
</div>


<div className="col-flex gap-6 mb-15 w-full md:gap-7.5">

    <TextInput id="email" name="email" type="email" label="Email" placeholder="Enter your email" />
</div>

<div className="w-full col-flex gap-3.5">
  <Button className="bg-foreground text-background w-full p-3.5">Send OTP</Button>  
  <Button className="border-2 border-foreground text-foreground w-full p-3.5">Go back</Button>  
</div>


    </form>
  );
}
