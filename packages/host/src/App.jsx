import { Suspense } from "react";  

export function App() {
    return (
        <Suspense fallback={<div>Loading....</div>}>
            <div>Hello from host application</div>
        </Suspense>
    );
}