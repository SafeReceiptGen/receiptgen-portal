import gsap from "gsap";

export function shakeForm(form: HTMLElement | null) {
  if (!form) return;

  gsap.fromTo(
    form,
    { x: -8 },
    {
      x: 8,
      duration: 0.08,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        gsap.set(form, { x: 0 });
      },
    },
  );
}
