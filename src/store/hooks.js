// src/store/hooks.js — Phase 2: plain-JS typed-style Redux hooks.
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
