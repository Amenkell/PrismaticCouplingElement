!macro customInstall
  # Запуск приложения после установки только если не silent режим
  # В silent режиме приложение запустится через quitAndInstall с isForceRunAfter: true
  ${ifNot} ${Silent}
    ExecShell "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" ""
  ${endIf}
!macroend